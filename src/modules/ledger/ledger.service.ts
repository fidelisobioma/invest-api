import { prisma } from "../../lib/prisma.ts";

type PrismaTransactionClient = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

type DecimalLike = string | number | { toString(): string };

function externalCoinAccount(coin: string): string {
  return `external:${coin}`;
}

function platformReserveAccount(coin: string): string {
  return `platform:reserve:${coin}`;
}

const USD = "USD";
const PLATFORM_USD_LIABILITY = "platform:usd_liability";

function userWalletAccount(userId: string): string {
  return `user:${userId}`;
}

function userInvestedAccount(userId: string): string {
  return `user:${userId}:invested`;
}

async function adjustBalance(
  tx: PrismaTransactionClient,
  userId: string,
  delta: DecimalLike,
) {
  const deltaStr = `${delta}`;

  await tx.balance.upsert({
    where: { userId },
    update: { amount: { increment: deltaStr } },
    create: { userId, amount: deltaStr },
  });
}
export async function recordDepositCredit(
  tx: PrismaTransactionClient,
  params: {
    depositId: string;
    userId: string;
    coin: string;
    coinAmount: DecimalLike;
    usdValue: DecimalLike;
  },
) {
  const { depositId, userId, coin, coinAmount, usdValue } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "DEPOSIT",
      depositId,
      entries: {
        create: [
          {
            account: externalCoinAccount(coin),
            coin,
            amount: `-${coinAmount}`,
          },
          {
            account: platformReserveAccount(coin),
            coin,
            amount: `${coinAmount}`,
          },
          {
            account: PLATFORM_USD_LIABILITY,
            coin: USD,
            amount: `-${usdValue}`,
          },
          {
            account: userWalletAccount(userId),
            coin: USD,
            amount: `${usdValue}`,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, userId, usdValue);

  return transaction;
}

export async function recordInvestmentLock(
  tx: PrismaTransactionClient,
  params: { investmentId: string; userId: string; amount: DecimalLike },
) {
  const { investmentId, userId, amount } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "INVESTMENT",
      investmentId,
      entries: {
        create: [
          {
            account: userWalletAccount(userId),
            coin: USD,
            amount: `-${amount}`,
          },
          {
            account: userInvestedAccount(userId),
            coin: USD,
            amount: `${amount}`,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, userId, `-${amount}`);

  return transaction;
}

export async function recordInvestmentPayout(
  tx: PrismaTransactionClient,
  params: {
    investmentId: string;
    userId: string;
    principal: DecimalLike;
    profit: DecimalLike;
    total: DecimalLike;
  },
) {
  const { investmentId, userId, principal, profit, total } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "PAYOUT",
      investmentId,
      entries: {
        create: [
          {
            account: userInvestedAccount(userId),
            coin: USD,
            amount: `-${principal}`,
          },
          { account: PLATFORM_USD_LIABILITY, coin: USD, amount: `-${profit}` },
          { account: userWalletAccount(userId), coin: USD, amount: `${total}` },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, userId, total);

  return transaction;
}

export async function recordWithdrawalHold(
  tx: PrismaTransactionClient,
  params: { withdrawalId: string; userId: string; amountUsd: DecimalLike },
) {
  const { withdrawalId, userId, amountUsd } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "WITHDRAWAL",
      withdrawalId,
      entries: {
        create: [
          {
            account: userWalletAccount(userId),
            coin: USD,
            amount: `-${amountUsd}`,
          },
          {
            account: `${userWalletAccount(userId)}:pending_withdrawal`,
            coin: USD,
            amount: `${amountUsd}`,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, userId, `-${amountUsd}`);

  return transaction;
}

export async function recordWithdrawalApproval(
  tx: PrismaTransactionClient,
  params: {
    withdrawalId: string;
    userId: string;
    amountUsd: DecimalLike;
    coin: string;
    coinAmount: DecimalLike;
  },
) {
  const { withdrawalId, userId, amountUsd, coin, coinAmount } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "WITHDRAWAL",
      withdrawalId,
      entries: {
        create: [
          {
            account: `${userWalletAccount(userId)}:pending_withdrawal`,
            coin: USD,
            amount: `-${amountUsd}`,
          },
          {
            account: PLATFORM_USD_LIABILITY,
            coin: USD,
            amount: `${amountUsd}`,
          },
          {
            account: platformReserveAccount(coin),
            coin,
            amount: `-${coinAmount}`,
          },
          { account: externalCoinAccount(coin), coin, amount: `${coinAmount}` },
        ],
      },
    },
    include: { entries: true },
  });

  return transaction;
}

export async function recordWithdrawalRejection(
  tx: PrismaTransactionClient,
  params: { withdrawalId: string; userId: string; amountUsd: DecimalLike },
) {
  const { withdrawalId, userId, amountUsd } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "WITHDRAWAL",
      withdrawalId,
      entries: {
        create: [
          {
            account: `${userWalletAccount(userId)}:pending_withdrawal`,
            coin: USD,
            amount: `-${amountUsd}`,
          },
          {
            account: userWalletAccount(userId),
            coin: USD,
            amount: `${amountUsd}`,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, userId, amountUsd);

  return transaction;
}

export async function recordReferralBonus(
  tx: PrismaTransactionClient,
  params: {
    referralBonusId: string;
    referrerId: string;
    amountUsd: DecimalLike;
  },
) {
  const { referralBonusId, referrerId, amountUsd } = params;

  const transaction = await tx.transaction.create({
    data: {
      type: "REFERRAL_BONUS",
      referralBonusId,
      entries: {
        create: [
          {
            account: "platform:usd_liability",
            coin: "USD",
            amount: `-${amountUsd}`,
          },
          {
            account: `user:${referrerId}`,
            coin: "USD",
            amount: `${amountUsd}`,
          },
        ],
      },
    },
    include: { entries: true },
  });

  await adjustBalance(tx, referrerId, amountUsd);

  return transaction;
}
