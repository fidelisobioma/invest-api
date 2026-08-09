import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validateQuery } from "../../middleware/validate.middleware.ts";
import { listTransactionsQuerySchema } from "./transactions.types.ts";
import { listMyTransactionsHandler } from "./transactions.controller.ts";

const router = Router();

router.get(
  "/",
  requireAuth,
  validateQuery(listTransactionsQuerySchema),
  listMyTransactionsHandler,
);

export default router;
