import { prisma } from "../../lib/prisma.ts";
import type { ListTransactionsQuery } from "./transactions.types.ts";

export async function listUserTransactions(
  userId: string,
  filters: ListTransactionsQuery,
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      type: filters.type,
      OR: [
        { deposit: { userId } },
        { withdrawal: { userId } },
        { investment: { userId } },
      ],
    },
    include: {
      entries: true,
      deposit: {
        select: {
          txHash: true,
          amount: true,
          adminWallet: { select: { coin: true } },
        },
      },
      withdrawal: {
        select: {
          amountUsd: true,
          coin: true,
          coinAmount: true,
          address: true,
          txHash: true,
        },
      },
      investment: {
        select: {
          amount: true,
          payoutAmount: true,
          plan: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    createdAt: t.createdAt,
    entries: t.entries
      .filter((e) => e.account.startsWith(`user:${userId}`))
      .map((e) => ({
        account: e.account,
        coin: e.coin,
        amount: e.amount,
      })),
    deposit: t.deposit,
    withdrawal: t.withdrawal,
    investment: t.investment,
  }));
}
