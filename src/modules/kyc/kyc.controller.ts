import type { Request, Response, NextFunction } from "express";
import * as kycService from "./kyc.service.ts";
import { AppError } from "../../lib/error.ts";
import type {
  SubmitKycInput,
  ListKycSubmissionsQuery,
  ReviewKycInput,
  RejectKycInput,
} from "./kyc.types.ts";

export async function submitKycHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const input = req.body as SubmitKycInput;
    const submission = await kycService.submitKyc(req.user.userId, input);
    res.status(201).json({ submission });
  } catch (err) {
    next(err);
  }
}

export async function getMyKycStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const status = await kycService.getMyKycStatus(req.user.userId);
    res.status(200).json(status);
  } catch (err) {
    next(err);
  }
}

export async function listKycSubmissionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.validatedQuery as ListKycSubmissionsQuery;
    const submissions = await kycService.listKycSubmissions(status);
    res.status(200).json({ submissions });
  } catch (err) {
    next(err);
  }
}

export async function approveKycHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { reviewNote } = req.body as ReviewKycInput;
    const submission = await kycService.approveKyc(
      req.params.id as string,
      reviewNote,
    );
    res.status(200).json({ submission });
  } catch (err) {
    next(err);
  }
}

export async function rejectKycHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { reviewNote } = req.body as RejectKycInput;
    const submission = await kycService.rejectKyc(
      req.params.id as string,
      reviewNote,
    );
    res.status(200).json({ submission });
  } catch (err) {
    next(err);
  }
}
