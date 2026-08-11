import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Must be a valid email address").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
