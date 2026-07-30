import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.ts";
import type { SignupInput, LoginInput } from "./auth.types.ts";
import { AppError } from "../../lib/error.ts";
import { signToken } from "../../lib/jwt.ts";

const SOUND_ROUNDS = 10;

export async function signup(input: SignupInput) {
  // find email the incoming email in the database
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  //Check if email exist in the database
  if (existing) {
    // Tell the user the email is already taken by another user
    throw new AppError("An account with this email already exists", 409);
  }

  // Hash password
  const hashPassword = await bcrypt.hash(input.password, SOUND_ROUNDS);
  //   Register a valid user
  const user = await prisma.user.create({
    data: { email: input.email, password: hashPassword, name: input.name },
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
