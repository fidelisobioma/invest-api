import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt.ts";
import { AppError } from "../lib/error.ts";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid Authorization header", 401));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
