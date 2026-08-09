import type { Request, Response, NextFunction } from "express";
import * as transactionsService from "./transactions.service.ts";
import { AppError } from "../../lib/error.ts";
import type { ListTransactionsQuery } from "./transactions.types.ts";

export async function listMyTransactionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const filters = req.validatedQuery as ListTransactionsQuery;
    const transactions = await transactionsService.listUserTransactions(
      req.user.userId,
      filters,
    );
    res.status(200).json({ transactions });
  } catch (err) {
    next(err);
  }
}
