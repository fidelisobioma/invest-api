import type { Request, Response, NextFunction } from "express";

import * as balancesService from "./balances.service.ts";
import { AppError } from "../../lib/error.ts";

export async function listBalancesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const balances = await balancesService.listBalances(req.user.userId);
    res.status(200).json({ balances });
  } catch (err) {
    next(err);
  }
}
