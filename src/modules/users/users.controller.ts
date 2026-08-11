import type { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service.ts";
import { AppError } from "../../lib/error.ts";
import type { UpdateProfileInput, ChangePasswordInput } from "./users.types.ts";

export async function getProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const profile = await usersService.getProfile(req.user.userId);
    res.status(200).json({ user: profile });
  } catch (err) {
    next(err);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const input = req.body as UpdateProfileInput;
    const profile = await usersService.updateProfile(req.user.userId, input);
    res.status(200).json({ user: profile });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);
    const input = req.body as ChangePasswordInput;
    await usersService.changePassword(req.user.userId, input);
    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}
