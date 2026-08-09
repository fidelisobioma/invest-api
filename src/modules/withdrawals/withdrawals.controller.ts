import type { Request, Response, NextFunction } from "express";
import * as withdrawalsService from "./withdrawals.service.ts";
import { AppError } from "../../lib/error.ts";
import type {
  CreateWithdrawalInput,
  ListWithdrawalsQuery,
  ApproveWithdrawalInput,
  RejectWithdrawalInput,
} from "./withdrawals.types.ts";

export async function createWithdrawalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const input = req.body as CreateWithdrawalInput;
    const withdrawal = await withdrawalsService.createWithdrawal(
      req.user.userId,
      input,
    );
    res.status(201).json({ withdrawal });
  } catch (err) {
    next(err);
  }
}

export async function listMyWithdrawalsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const withdrawals = await withdrawalsService.listUserWithdrawals(
      req.user.userId,
    );
    res.status(200).json({ withdrawals });
  } catch (err) {
    next(err);
  }
}

export async function listAllWithdrawalsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.validatedQuery as ListWithdrawalsQuery;
    const withdrawals = await withdrawalsService.listAllWithdrawals(status);
    res.status(200).json({ withdrawals });
  } catch (err) {
    next(err);
  }
}

export async function approveWithdrawalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { txHash, reviewNote } = req.body as ApproveWithdrawalInput;
    const withdrawal = await withdrawalsService.approveWithdrawal(
      req.params.id as string,
      txHash,
      reviewNote,
    );
    res.status(200).json({ withdrawal });
  } catch (err) {
    next(err);
  }
}

export async function rejectWithdrawalHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { reviewNote } = req.body as RejectWithdrawalInput;
    const withdrawal = await withdrawalsService.rejectWithdrawal(
      req.params.id as string,
      reviewNote,
    );
    res.status(200).json({ withdrawal });
  } catch (err) {
    next(err);
  }
}
