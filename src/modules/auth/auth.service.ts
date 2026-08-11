import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { signToken } from "../../lib/jwt.ts";
import { generateUniqueReferralCode } from "../referrals/referrals.service.ts";
import { sendPasswordResetEmail } from "../../lib/resend.ts";
import type {
  SignupInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "./auth.types.ts";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  let referredById: string | undefined;

  if (input.referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: input.referralCode },
      select: { id: true },
    });

    if (!referrer) {
      throw new AppError("Invalid referral code", 400);
    }

    referredById = referrer.id;
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const referralCode = await generateUniqueReferralCode();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name,
      referralCode,
      referredById,
    },
  });

  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id });

  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    return;
  }

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(user.email, resetUrl);
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt !== null ||
    resetToken.expiresAt < new Date()
  ) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
