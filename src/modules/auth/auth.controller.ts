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
