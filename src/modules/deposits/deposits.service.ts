import QRCode from "qrcode";
import { prisma } from "../../lib/prisma.ts";

import type { CreateDepositInput } from "./deposits.types.ts";
import { AppError } from "../../lib/error.ts";

async function getActiveWallet(coin: string) {
  const wallet = await prisma.adminWallet.findFirst({
    where: { coin, isActive: true },
  });

  if (!wallet) {
    throw new AppError(`No active deposit address configured for ${coin}`, 404);
  }

  return wallet;
}

export async function getDepositAddress(coin: string) {
  const wallet = await getActiveWallet(coin);
  const qrCode = await QRCode.toDataURL(wallet.address);

  return {
    coin: wallet.coin,
    network: wallet.network,
    address: wallet.address,
    qrCode,
  };
}

export async function createDeposit(userId: string, input: CreateDepositInput) {
  const wallet = await getActiveWallet(input.coin);

  try {
    const deposit = await prisma.deposit.create({
      data: {
        userId,
        adminWalletId: wallet.id,
        txHash: input.txHash,
        amount: input.amount,
      },
    });

    return deposit;
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      throw new AppError(
        "This transaction hash has already been submitted",
        409,
      );
    }
    throw err;
  }
}
