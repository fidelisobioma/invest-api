import type { Request, Response, NextFunction } from "express";
import * as balancesService from "./balances.service.ts";
import { AppError } from "../../lib/error.ts";

export async function getBalanceHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const balance = await balancesService.getBalance(req.user.userId);
    res.status(200).json(balance);
  } catch (err) {
    next(err);
  }
}
