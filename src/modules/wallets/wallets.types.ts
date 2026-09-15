import { z } from "zod";
import { SUPPORTED_COINS } from "../deposits/deposits.types.ts";

export const upsertWalletSchema = z.object({
  coin: z.enum(SUPPORTED_COINS, {
    message: `coin must be one of: ${SUPPORTED_COINS.join(", ")}`,
  }),
  network: z.string().min(1, "Network is required"),
  address: z.string().min(1, "Address is required"),
});

export type UpsertWalletInput = z.infer<typeof upsertWalletSchema>;

export const setWalletActiveSchema = z.object({
  isActive: z.boolean(),
});

export type SetWalletActiveInput = z.infer<typeof setWalletActiveSchema>;
