import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.ts";
import type { SignupInput, LoginInput } from "./auth.types.ts";
import { AppError } from "../../lib/error.ts";
import { signToken } from "../../lib/jwt.ts";
import { generateUniqueReferralCode } from "../referrals/referrals.service.ts"; // add this import

const SALT_ROUNDS = 10;

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
  // Find and return a user with the submitted email
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Check if the user does'nt exist then return res
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Compare submitted password with hashed password
  const passwordMatch = await bcrypt.compare(input.password, user.password);

  if (!passwordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user.id });
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}
