import type { Request, Response, NextFunction } from "express";
import * as referralsService from "./referrals.service.ts";
import { AppError } from "../../lib/error.ts";

export async function getReferralSummaryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    const summary = await referralsService.getReferralSummary(req.user.userId);

    if (!summary) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}
