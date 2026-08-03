import { prisma } from "../../lib/prisma.ts";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

type DecimalLike = string | number | { toString(): string };

function decimalLikeToString(value: DecimalLike): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : value.toString();
}

function platformReserveAccount(coin: string): string {
  return `platform:reserve:${coin}`;
}

function userAccount(userId: string, coin: string): string {
  return `user:${userId}:${coin}`;
}

export async function recordDepositCredit(
  tx: PrismaTransactionClient,
  params: {
    depositId: string;
    userId: string;
    coin: string;
    amount: DecimalLike;
  },
) {
  const { depositId, userId, coin, amount } = params;
  const amountValue = decimalLikeToString(amount);

  const transaction = await tx.transaction.create({
    data: {
      type: "DEPOSIT",
      depositId,
      entries: {
        create: [
          {
            account: platformReserveAccount(coin),
            coin,
            amount: `-${amountValue}`,
          },
          {
            account: userAccount(userId, coin),
            coin,
            amount: amountValue,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await tx.balance.upsert({
    where: { userId_coin: { userId, coin } },
    update: { amount: { increment: amountValue } },
    create: { userId, coin, amount: amountValue },
  });

  return transaction;
}
