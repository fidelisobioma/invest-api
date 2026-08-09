import { prisma } from "../../lib/prisma.ts";

export async function getBalance(userId: string) {
  const balance = await prisma.balance.findUnique({
    where: { userId },
    select: { amount: true, updatedAt: true },
  });

  return {
    usd: balance ? balance.amount.toString() : "0",
    updatedAt: balance?.updatedAt ?? null,
  };
}
