import jwt from "jsonwebtoken";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET is not set in the environment variable");
  })();

const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  userId: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}
