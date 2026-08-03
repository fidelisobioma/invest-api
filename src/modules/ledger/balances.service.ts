import { prisma } from "../../lib/prisma.ts";

export async function listBalances(userId: string) {
  return prisma.balance.findMany({
    where: { userId },
    select: { coin: true, amount: true, updatedAt: true },
    orderBy: { coin: "asc" },
  });
}
