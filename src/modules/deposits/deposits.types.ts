import { z } from "zod";

export const SUPPORTED_COINS = ["BTC", "ETH", "USDT", "BNB", "SOL"] as const;

export const depositAddressQuerySchema = z.object({
  coin: z.enum(SUPPORTED_COINS, {
    message: `Coins must be of:${SUPPORTED_COINS.join(", ")}`,
  }),
});

export type DepositAddressQuery = z.infer<typeof depositAddressQuerySchema>;

export const createDepositSchema = z.object({
  coin: z.enum(SUPPORTED_COINS, {
    message: `coin must be one of: ${SUPPORTED_COINS.join(", ")}`,
  }),
  txHash: z.string().min(1, "Transaction hash is required"),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a valid positive number")
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

export type CreateDepositInput = z.infer<typeof createDepositSchema>;

export const DEPOSIT_STATUSES = ["PENDING", "CONFIRMED", "REJECTED"] as const;

export const listDepositsQuerySchema = z.object({
  status: z.enum(DEPOSIT_STATUSES).optional(),
});

export type ListDepositsQuery = z.infer<typeof listDepositsQuerySchema>;

export const approveDepositSchema = z.object({
  reviewNote: z.string().optional(),
});

export type ApproveDepositInput = z.infer<typeof approveDepositSchema>;

export const rejectDepositSchema = z.object({
  reviewNote: z
    .string()
    .min(1, "A reason is required when rejecting a deposit"),
});

export type RejectDepositInput = z.infer<typeof rejectDepositSchema>;
