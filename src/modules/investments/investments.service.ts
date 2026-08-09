import { Decimal } from "decimal.js";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import {
  recordInvestmentLock,
  recordInvestmentPayout,
} from "../ledger/ledger.service.ts";
import type { CreateInvestmentInput } from "./investments.types.ts";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export async function listActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { minAmountUsd: "asc" },
  });
}

export async function createInvestment(
  userId: string,
  input: CreateInvestmentInput,
) {
  const plan = await prisma.plan.findUnique({ where: { id: input.planId } });

  if (!plan || !plan.isActive) {
    throw new AppError("Investment plan not found or no longer active", 404);
  }

  const amount = new Decimal(input.amount);
  const minAmountUsd = new Decimal(plan.minAmountUsd.toString());
  const maxAmountUsd = new Decimal(plan.maxAmountUsd.toString());

  if (amount.lt(minAmountUsd) || amount.gt(maxAmountUsd)) {
    throw new AppError(
      `Amount must be between $${minAmountUsd.toString()} and $${maxAmountUsd.toString()} for the ${plan.name} plan`,
      400,
    );
  }

  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const balance = await tx.balance.findUnique({ where: { userId } });
    const currentBalance = balance
      ? new Decimal(balance.amount.toString())
      : new Decimal(0);

    if (currentBalance.lt(amount)) {
      throw new AppError("Insufficient balance to make this investment", 400);
    }

    const maturityAt = new Date();
    maturityAt.setDate(maturityAt.getDate() + plan.durationDays);

    const investment = await tx.investment.create({
      data: {
        userId,
        planId: plan.id,
        amount: input.amount,
        roiPercent: plan.roiPercent,
        maturityAt,
      },
    });

    await recordInvestmentLock(tx, {
      investmentId: investment.id,
      userId,
      amount: input.amount,
    });

    return investment;
  });
}

export async function listUserInvestments(userId: string) {
  return prisma.investment.findMany({
    where: { userId },
    include: { plan: { select: { name: true } } },
    orderBy: { startedAt: "desc" },
  });
}

export async function listAllInvestments(status?: "ACTIVE" | "PAID_OUT") {
  return prisma.investment.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
      plan: { select: { name: true } },
    },
    orderBy: { startedAt: "asc" },
  });
}

export async function payoutInvestment(investmentId: string) {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const investment = await tx.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      throw new AppError("Investment not found", 404);
    }

    if (investment.status !== "ACTIVE") {
      throw new AppError("This investment has already been paid out", 409);
    }

    if (new Date() < investment.maturityAt) {
      throw new AppError(
        `This investment matures on ${investment.maturityAt.toISOString()} and cannot be paid out yet`,
        409,
      );
    }

    const principal = new Decimal(investment.amount.toString());
    const roiPercent = new Decimal(investment.roiPercent.toString());
    const profit = principal.mul(roiPercent).div(100);
    const total = principal.plus(profit);

    const updated = await tx.investment.update({
      where: { id: investmentId },
      data: {
        status: "PAID_OUT",
        paidOutAt: new Date(),
        payoutAmount: total.toString(),
      },
    });

    await recordInvestmentPayout(tx, {
      investmentId: investment.id,
      userId: investment.userId,
      principal: principal.toString(),
      profit: profit.toString(),
      total: total.toString(),
    });

    return updated;
  });
}
