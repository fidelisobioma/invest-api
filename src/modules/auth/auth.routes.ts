import { Router } from "express";
import {
  signupHandler,
  loginHandler,
  logoutHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "./auth.controller.ts"; // update this import line

import { validate } from "../../middleware/validate.middleware.ts";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.types.ts";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);

router.post("/login", validate(loginSchema), loginHandler);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordHandler,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordHandler,
);

router.post("/logout", logoutHandler);

export default router;
