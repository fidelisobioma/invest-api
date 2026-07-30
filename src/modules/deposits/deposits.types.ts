import { z } from "zod";

export const SUPPORTED_COINS = ["BTC", "ETH", "USDT", "BNB", "SOL"] as const;

export const depositAddressQuerySchema = z.object({
  coin: z.enum(SUPPORTED_COINS, {
    message: `Coins must be of:${SUPPORTED_COINS.join(", ")}`,
  }),
});

export type DepositAddressQuery = z.infer<typeof depositAddressQuerySchema>;
