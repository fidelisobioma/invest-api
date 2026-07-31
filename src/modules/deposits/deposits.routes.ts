import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import {
  validate,
  validateQuery,
} from "../../middleware/validate.middleware.ts";
import {
  depositAddressQuerySchema,
  createDepositSchema,
} from "./deposits.types.ts";
import {
  getDepositAddressHandler,
  createDepositHandler,
} from "./deposits.controller.ts";

const router = Router();

router.get(
  "/address",
  requireAuth,
  validateQuery(depositAddressQuerySchema),
  getDepositAddressHandler,
);

router.post(
  "/",
  requireAuth,
  validate(createDepositSchema),
  createDepositHandler,
);

export default router;
