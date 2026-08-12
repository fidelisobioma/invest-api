import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import type { SubmitKycInput, KYC_STATUSES } from "./kyc.types.ts";

type KycStatusValue = (typeof KYC_STATUSES)[number];

export async function submitKyc(userId: string, input: SubmitKycInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.kycStatus === "PENDING") {
    throw new AppError("Your KYC submission is already under review", 409);
  }

  if (user.kycStatus === "APPROVED") {
    throw new AppError("Your identity is already verified", 409);
  }

  const [submission] = await prisma.$transaction([
    prisma.kycSubmission.create({
      data: {
        userId,
        legalName: input.legalName,
        dateOfBirth: input.dateOfBirth,
        country: input.country,
        idNumber: input.idNumber,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    }),
  ]);

  return submission;
}

export async function getMyKycStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      kycStatus: true,
      kycSubmissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    kycStatus: user.kycStatus,
    latestSubmission: user.kycSubmissions[0] ?? null,
  };
}

export async function listKycSubmissions(status?: KycStatusValue) {
  return prisma.kycSubmission.findMany({
    where: status ? { status } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function getReviewableSubmission(submissionId: string) {
  const submission = await prisma.kycSubmission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new AppError("KYC submission not found", 404);
  }

  if (submission.status !== "PENDING") {
    throw new AppError(
      `This submission has already been ${submission.status.toLowerCase()} and cannot be reviewed again`,
      409,
    );
  }

  return submission;
}

export async function approveKyc(submissionId: string, reviewNote?: string) {
  const submission = await getReviewableSubmission(submissionId);

  const [updated] = await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id: submissionId },
      data: { status: "APPROVED", reviewedAt: new Date(), reviewNote },
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: "APPROVED" },
    }),
  ]);

  return updated;
}

export async function rejectKyc(submissionId: string, reviewNote: string) {
  const submission = await getReviewableSubmission(submissionId);

  const [updated] = await prisma.$transaction([
    prisma.kycSubmission.update({
      where: { id: submissionId },
      data: { status: "REJECTED", reviewedAt: new Date(), reviewNote },
    }),
    prisma.user.update({
      where: { id: submission.userId },
      data: { kycStatus: "REJECTED" },
    }),
  ]);

  return updated;
}
