import { Decimal } from "decimal.js";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { getUsdPrice } from "../prices/prices.service.ts";
import {
  recordWithdrawalHold,
  recordWithdrawalApproval,
  recordWithdrawalRejection,
} from "../ledger/ledger.service.ts";
import type {
  CreateWithdrawalInput,
  WITHDRAWAL_STATUSES,
} from "./withdrawals.types.ts";

type WithdrawalStatusValue = (typeof WITHDRAWAL_STATUSES)[number];
type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export async function createWithdrawal(
  userId: string,
  input: CreateWithdrawalInput,
) {
  const amountUsd = new Decimal(input.amountUsd);

  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const balance = await tx.balance.findUnique({ where: { userId } });
    const currentBalance = balance
      ? new Decimal(balance.amount.toString())
      : new Decimal(0);

    if (currentBalance.lt(amountUsd)) {
      throw new AppError(
        "Insufficient balance to request this withdrawal",
        400,
      );
    }

    const withdrawal = await tx.withdrawal.create({
      data: {
        userId,
        amountUsd: input.amountUsd,
        coin: input.coin,
        address: input.address,
      },
    });

    await recordWithdrawalHold(tx, {
      withdrawalId: withdrawal.id,
      userId,
      amountUsd: input.amountUsd,
    });

    return withdrawal;
  });
}

export async function listUserWithdrawals(userId: string) {
  return prisma.withdrawal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllWithdrawals(status?: WithdrawalStatusValue) {
  return prisma.withdrawal.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getReviewableWithdrawal(
  tx: PrismaTransactionClient,
  withdrawalId: string,
) {
  const withdrawal = await tx.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new AppError("Withdrawal not found", 404);
  }

  if (withdrawal.status !== "PENDING") {
    throw new AppError(
      `This withdrawal has already been ${withdrawal.status.toLowerCase()} and cannot be reviewed again`,
      409,
    );
  }

  return withdrawal;
}

export async function approveWithdrawal(
  withdrawalId: string,
  txHash: string,
  reviewNote?: string,
) {
  const withdrawal = await prisma.withdrawal.findUnique({
    where: { id: withdrawalId },
  });

  if (!withdrawal) {
    throw new AppError("Withdrawal not found", 404);
  }

  if (withdrawal.status !== "PENDING") {
    throw new AppError(
      `This withdrawal has already been ${withdrawal.status.toLowerCase()} and cannot be reviewed again`,
      409,
    );
  }

  const amountUsd = new Decimal(withdrawal.amountUsd.toString());
  const price = await getUsdPrice(withdrawal.coin);
  const coinAmount = amountUsd.div(price);

  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    await getReviewableWithdrawal(tx, withdrawalId);

    const updated = await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "PROCESSED",
        coinAmount: coinAmount.toString(),
        txHash,
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    await recordWithdrawalApproval(tx, {
      withdrawalId: withdrawal.id,
      userId: withdrawal.userId,
      amountUsd: withdrawal.amountUsd.toString(),
      coin: withdrawal.coin,
      coinAmount: coinAmount.toString(),
    });

    return updated;
  });
}

export async function rejectWithdrawal(
  withdrawalId: string,
  reviewNote: string,
) {
  return prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const withdrawal = await getReviewableWithdrawal(tx, withdrawalId);

    const updated = await tx.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    await recordWithdrawalRejection(tx, {
      withdrawalId: withdrawal.id,
      userId: withdrawal.userId,
      amountUsd: withdrawal.amountUsd.toString(),
    });

    return updated;
  });
}
