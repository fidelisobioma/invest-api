import QRCode from "qrcode";
import { prisma } from "../../lib/prisma.ts";

import type { CreateDepositInput, DEPOSIT_STATUSES } from "./deposits.types.ts";
import { AppError } from "../../lib/error.ts";

type DepositStatusValue = (typeof DEPOSIT_STATUSES)[number];

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

export async function listDeposits(status?: DepositStatusValue) {
  return prisma.deposit.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
      adminWallet: { select: { coin: true, network: true, address: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function reviewDeposit(
  depositId: string,
  newStatus: Extract<DepositStatusValue, "CONFIRMED" | "REJECTED">,
  reviewNote?: string,
) {
  const deposit = await prisma.deposit.findUnique({
    where: { id: depositId },
  });

  if (!deposit) {
    throw new AppError("Deposit not found", 404);
  }

  if (deposit.status !== "PENDING") {
    throw new AppError(
      `This deposit has already been ${deposit.status.toLowerCase()} and cannot be reviewed again`,
      409,
    );
  }

  return prisma.deposit.update({
    where: { id: depositId },
    data: {
      status: newStatus,
      reviewedAt: new Date(),
      reviewNote,
    },
  });
}

export async function approveDeposit(depositId: string, reviewNote?: string) {
  return reviewDeposit(depositId, "CONFIRMED", reviewNote);
}

export async function rejectDeposit(depositId: string, reviewNote: string) {
  return reviewDeposit(depositId, "REJECTED", reviewNote);
}
