import type { Request, Response, NextFunction } from "express";
import * as depositsService from "./deposits.service.ts";

import type {
  DepositAddressQuery,
  CreateDepositInput,
} from "./deposits.types.ts";
import { AppError } from "../../lib/error.ts";

export async function getDepositAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { coin } = req.validatedQuery as DepositAddressQuery;
    const result = await depositsService.getDepositAddress(coin);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createDepositHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const input = req.body as CreateDepositInput;
    const deposit = await depositsService.createDeposit(req.user.userId, input);
    res.status(201).json({ deposit });
  } catch (err) {
    next(err);
  }
}
