import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.ts";
import type { signupInput } from "./auth.types.ts";
import { AppError } from "../../lib/error.ts";

const SOUND_ROUNDS = 10;

export async function signup(input: signupInput) {
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
