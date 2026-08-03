import QRCode from "qrcode";
import { prisma } from "../../lib/prisma.ts";
import { recordDepositCredit } from "../ledger/ledger.service.ts";
import type { CreateDepositInput, DEPOSIT_STATUSES } from "./deposits.types.ts";
import { AppError } from "../../lib/error.ts";

type DepositStatusValue = (typeof DEPOSIT_STATUSES)[number];

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

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

async function getReviewableDeposit(
  tx: PrismaTransactionClient,
  depositId: string,
) {
  const deposit = await tx.deposit.findUnique({
    where: { id: depositId },
    include: { adminWallet: { select: { coin: true } } },
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

  return deposit;
}

export async function approveDeposit(depositId: string, reviewNote?: string) {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const deposit = await getReviewableDeposit(tx, depositId);

    const updated = await tx.deposit.update({
      where: { id: depositId },
      data: {
        status: "CONFIRMED",
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    await recordDepositCredit(tx, {
      depositId: deposit.id,
      userId: deposit.userId,
      coin: deposit.adminWallet.coin,
      amount: deposit.amount,
    });

    return updated;
  });
}

export async function rejectDeposit(depositId: string, reviewNote: string) {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await getReviewableDeposit(tx, depositId);

    return tx.deposit.update({
      where: { id: depositId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewNote,
      },
    });
  });
}
