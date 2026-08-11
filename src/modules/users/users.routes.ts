import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { updateProfileSchema, changePasswordSchema } from "./users.types.ts";
import {
  getProfileHandler,
  updateProfileHandler,
  changePasswordHandler,
} from "./users.controller.ts";

const router = Router();

router.get("/", requireAuth, getProfileHandler);

router.patch(
  "/",
  requireAuth,
  validate(updateProfileSchema),
  updateProfileHandler,
);

router.patch(
  "/password",
  requireAuth,
  validate(changePasswordSchema),
  changePasswordHandler,
);

export default router;
