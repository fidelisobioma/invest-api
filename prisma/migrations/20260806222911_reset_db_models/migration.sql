/*
  Warnings:

  - You are about to drop the column `coin` on the `balances` table. All the data in the column will be lost.
  - You are about to drop the column `coin` on the `investments` table. All the data in the column will be lost.
  - You are about to drop the column `maxAmount` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the column `minAmount` on the `plans` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `balances` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[withdrawalId]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `maxAmountUsd` to the `plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAmountUsd` to the `plans` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'PROCESSED', 'REJECTED');

-- DropIndex
DROP INDEX "balances_userId_coin_key";

-- AlterTable
ALTER TABLE "balances" DROP COLUMN "coin";

-- AlterTable
ALTER TABLE "deposits" ADD COLUMN     "usdValueAtConfirmation" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "investments" DROP COLUMN "coin";

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "maxAmount",
DROP COLUMN "minAmount",
ADD COLUMN     "maxAmountUsd" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "minAmountUsd" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "withdrawalId" TEXT;

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountUsd" DECIMAL(65,30) NOT NULL,
    "coin" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "coinAmount" DECIMAL(65,30),
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "balances_userId_key" ON "balances"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_withdrawalId_key" ON "transactions"("withdrawalId");

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "withdrawals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
