import type { Request, Response, NextFunction } from "express";
import * as investmentsService from "./investments.service.ts";

import type { CreateInvestmentInput } from "./investments.types.ts";
import { AppError } from "../../lib/error.ts";

export async function listPlansHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const plans = await investmentsService.listActivePlans();
    res.status(200).json({ plans });
  } catch (err) {
    next(err);
  }
}

export async function createInvestmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const input = req.body as CreateInvestmentInput;
    const investment = await investmentsService.createInvestment(
      req.user.userId,
      input,
    );
    res.status(201).json({ investment });
  } catch (err) {
    next(err);
  }
}

export async function listMyInvestmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const investments = await investmentsService.listUserInvestments(
      req.user.userId,
    );
    res.status(200).json({ investments });
  } catch (err) {
    next(err);
  }
}

export async function listAllInvestmentsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const status = req.query.status as "ACTIVE" | "PAID_OUT" | undefined;
    const investments = await investmentsService.listAllInvestments(status);
    res.status(200).json({ investments });
  } catch (err) {
    next(err);
  }
}

export async function payoutInvestmentHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const investment = await investmentsService.payoutInvestment(
      req.params.id as string,
    );
    res.status(200).json({ investment });
  } catch (err) {
    next(err);
  }
}
