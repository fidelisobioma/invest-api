import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { requireAdmin } from "../../middleware/admin.middleware.ts";
import {
  validate,
  validateQuery,
} from "../../middleware/validate.middleware.ts";
import {
  listWithdrawalsQuerySchema,
  approveWithdrawalSchema,
  rejectWithdrawalSchema,
} from "./withdrawals.types.ts";
import {
  listAllWithdrawalsHandler,
  approveWithdrawalHandler,
  rejectWithdrawalHandler,
} from "./withdrawals.controller.ts";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/",
  validateQuery(listWithdrawalsQuerySchema),
  listAllWithdrawalsHandler,
);
router.patch(
  "/:id/approve",
  validate(approveWithdrawalSchema),
  approveWithdrawalHandler,
);
router.patch(
  "/:id/reject",
  validate(rejectWithdrawalSchema),
  rejectWithdrawalHandler,
);

export default router;
