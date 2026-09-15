import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.ts";
import { AppError } from "../lib/error.ts";
import { AUTH_COOKIE_NAME } from "../lib/cookies.ts";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
