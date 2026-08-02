import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
import { AppError } from "../lib/error.ts";

export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      throw new AppError("Admin access required", 403);
    }

    next();
  } catch (err) {
    next(err);
  }
}
