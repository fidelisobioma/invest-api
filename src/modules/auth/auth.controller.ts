import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.ts";

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.forgotPassword(req.body);
    res.status(200).json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    next(err);
  }
}
