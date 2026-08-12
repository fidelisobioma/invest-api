import { z } from "zod";

export const submitKycSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  dateOfBirth: z.coerce.date({ message: "A valid date of birth is required" }),
  country: z.string().min(1, "Country is required"),
  idNumber: z.string().min(1, "ID number is required"),
});

export type SubmitKycInput = z.infer<typeof submitKycSchema>;

export const KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export const listKycSubmissionsQuerySchema = z.object({
  status: z.enum(KYC_STATUSES).optional(),
});

export type ListKycSubmissionsQuery = z.infer<
  typeof listKycSubmissionsQuerySchema
>;

export const reviewKycSchema = z.object({
  reviewNote: z.string().optional(),
});

export type ReviewKycInput = z.infer<typeof reviewKycSchema>;

export const rejectKycSchema = z.object({
  reviewNote: z
    .string()
    .min(1, "A reason is required when rejecting a KYC submission"),
});

export type RejectKycInput = z.infer<typeof rejectKycSchema>;
