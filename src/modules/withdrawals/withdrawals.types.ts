import { z } from "zod";
import { SUPPORTED_COINS } from "../deposits/deposits.types.ts";

export const createWithdrawalSchema = z.object({
  amountUsd: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a valid positive number")
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  coin: z.enum(SUPPORTED_COINS, {
    message: `coin must be one of: ${SUPPORTED_COINS.join(", ")}`,
  }),
  address: z.string().min(1, "Destination address is required"),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;

export const WITHDRAWAL_STATUSES = [
  "PENDING",
  "PROCESSED",
  "REJECTED",
] as const;

export const listWithdrawalsQuerySchema = z.object({
  status: z.enum(WITHDRAWAL_STATUSES).optional(),
});

export type ListWithdrawalsQuery = z.infer<typeof listWithdrawalsQuerySchema>;

export const approveWithdrawalSchema = z.object({
  txHash: z
    .string()
    .min(1, "txHash is required to confirm the payout was sent"),
  reviewNote: z.string().optional(),
});

export type ApproveWithdrawalInput = z.infer<typeof approveWithdrawalSchema>;

export const rejectWithdrawalSchema = z.object({
  reviewNote: z
    .string()
    .min(1, "A reason is required when rejecting a withdrawal"),
});

export type RejectWithdrawalInput = z.infer<typeof rejectWithdrawalSchema>;
