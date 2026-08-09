import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { createWithdrawalSchema } from "./withdrawals.types.ts";
import {
  createWithdrawalHandler,
  listMyWithdrawalsHandler,
} from "./withdrawals.controller.ts";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createWithdrawalSchema),
  createWithdrawalHandler,
);
router.get("/", requireAuth, listMyWithdrawalsHandler);

export default router;
