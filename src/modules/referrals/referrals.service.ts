import { randomBytes } from "node:crypto";
import { Decimal } from "decimal.js";
import { prisma } from "../../lib/prisma.ts";
import { recordReferralBonus } from "../ledger/ledger.service.ts";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export const REFERRAL_BONUS_USD = "10";

function generateCode(): string {
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!existing) {
      return code;
    }
  }
  throw new Error("Failed to generate a unique referral code after 5 attempts");
}

export async function maybeAwardReferralBonus(
  tx: PrismaTransactionClient,
  params: { depositId: string; userId: string },
) {
  const { depositId, userId } = params;

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  });

  if (!user?.referredById) {
    return null;
  }

  const confirmedDepositCount = await tx.deposit.count({
    where: { userId, status: "CONFIRMED" },
  });

  if (confirmedDepositCount !== 1) {
    return null;
  }

  const referralBonus = await tx.referralBonus.create({
    data: {
      referrerId: user.referredById,
      refereeId: userId,
      triggeringDepositId: depositId,
      amountUsd: REFERRAL_BONUS_USD,
    },
  });

  await recordReferralBonus(tx, {
    referralBonusId: referralBonus.id,
    referrerId: user.referredById,
    amountUsd: REFERRAL_BONUS_USD,
  });

  return referralBonus;
}

export async function getReferralSummary(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      referrals: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          referralBonusReceived: {
            select: { amountUsd: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      referralBonusesGiven: { select: { amountUsd: true } },
    },
  });

  if (!user) {
    return null;
  }

  const totalEarnedUsd = user.referralBonusesGiven
    .reduce((sum, b) => sum.plus(b.amountUsd.toString()), new Decimal(0))
    .toString();

  return {
    referralCode: user.referralCode,
    totalEarnedUsd,
    referrals: user.referrals.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      joinedAt: r.createdAt,
      bonusAwarded: r.referralBonusReceived !== null,
    })),
  };
}
