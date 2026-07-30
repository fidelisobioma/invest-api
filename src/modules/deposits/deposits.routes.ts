import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validateQuery } from "../../middleware/validate.middleware.ts";
import { depositAddressQuerySchema } from "./deposits.types.ts";
import { getDepositAddressHandler } from "./deposits.controller.ts";

const router = Router();

router.get(
  "/address",
  requireAuth,
  validateQuery(depositAddressQuerySchema),
  getDepositAddressHandler,
);

export default router;
