import { z } from "zod";

export const createInvestmentSchema = z.object({
  planId: z.string().min(1, "planId is required"),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Amount must be a valid positive number")
    .refine((val) => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
});

export type CreateInvestmentInput = z.infer<typeof createInvestmentSchema>;
