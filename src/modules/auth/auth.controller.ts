import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.ts";
console.log("hellos");

export async function signupHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log("Hey");
  console.log(req.body, "Hello");
  try {
    console.log(req.body);
    const user = await authService.signup(req.body);
    console.log(user);
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
    const user = await authService.login(req.body);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
