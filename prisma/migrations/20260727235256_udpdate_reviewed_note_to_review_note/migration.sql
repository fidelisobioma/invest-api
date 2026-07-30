/*
  Warnings:

  - You are about to drop the column `reviewedNote` on the `deposits` table. All the data in the column will be lost.
  - Added the required column `reviewNote` to the `deposits` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "deposits" DROP COLUMN "reviewedNote",
ADD COLUMN     "reviewNote" TEXT NOT NULL;
