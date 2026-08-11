import { z } from "zod";
export const signupSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1).optional(),
  referralCode: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Must be a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof signupSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
