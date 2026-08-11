import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import type { UpdateProfileInput, ChangePasswordInput } from "./users.types.ts";

const SALT_ROUNDS = 10;

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  if (input.email) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing && existing.id !== userId) {
      throw new AppError("An account with this email already exists", 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
    },
  });

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const currentPasswordMatches = await bcrypt.compare(
    input.currentPassword,
    user.password,
  );

  if (!currentPasswordMatches) {
    throw new AppError("Current password is incorrect", 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}
