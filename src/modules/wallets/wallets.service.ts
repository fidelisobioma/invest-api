import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import type { UpsertWalletInput } from "./wallets.types.ts";

export async function listWallets() {
  return prisma.adminWallet.findMany({
    orderBy: [{ coin: "asc" }, { network: "asc" }],
  });
}

export async function upsertWallet(input: UpsertWalletInput) {
  return prisma.adminWallet.upsert({
    where: { coin_network: { coin: input.coin, network: input.network } },
    update: { address: input.address, isActive: true },
    create: {
      coin: input.coin,
      network: input.network,
      address: input.address,
    },
  });
}

export async function setWalletActive(id: string, isActive: boolean) {
  const wallet = await prisma.adminWallet.findUnique({ where: { id } });

  if (!wallet) {
    throw new AppError("Wallet not found", 404);
  }

  return prisma.adminWallet.update({
    where: { id },
    data: { isActive },
  });
}
