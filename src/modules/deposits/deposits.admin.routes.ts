import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { requireAdmin } from "../../middleware/admin.middleware.ts";
import {
  validate,
  validateQuery,
} from "../../middleware/validate.middleware.ts";
import {
  listDepositsQuerySchema,
  approveDepositSchema,
  rejectDepositSchema,
} from "./deposits.types.ts";
import {
  listDepositsHandler,
  approveDepositHandler,
  rejectDepositHandler,
} from "./deposits.controller.ts";

const router = Router();

// Every route here requires both a valid token AND an admin role.
router.use(requireAuth, requireAdmin);

router.get("/", validateQuery(listDepositsQuerySchema), listDepositsHandler);

router.patch(
  "/:id/approve",
  validate(approveDepositSchema),
  approveDepositHandler,
);

router.patch(
  "/:id/reject",
  validate(rejectDepositSchema),
  rejectDepositHandler,
);

export default router;
