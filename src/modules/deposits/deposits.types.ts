import { z } from "zod";

export const SUPPORTED_COINS = ["BTC", "ETH", "USDT", "BNB", "SOL"] as const;

export const depositAddressQuerySchema = z.object({
  coin: z.enum(SUPPORTED_COINS, {
    message: `Coins must be of:${SUPPORTED_COINS.join(", ")}`,
  }),
});

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

export type DepositAddressQuery = z.infer<typeof depositAddressQuerySchema>;

export type CreateDepositInput = z.infer<typeof createDepositSchema>;
