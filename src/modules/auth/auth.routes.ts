import { Router } from "express";
import {
  signupHandler,
  loginHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from "./auth.controller.ts";
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

export default router;
