import type { Request, Response, NextFunction } from "express";
import * as depositsService from "./deposits.service.ts";
import type { DepositAddressQuery } from "./deposits.types.ts";

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
