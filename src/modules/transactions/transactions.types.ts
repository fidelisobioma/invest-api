import { z } from "zod";

export const TRANSACTION_TYPES = [
  "DEPOSIT",
  "WITHDRAWAL",
  "INVESTMENT",
  "PAYOUT",
  "REFERRAL_BONUS",
] as const;

export const listTransactionsQuerySchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
