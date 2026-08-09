import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { requireAdmin } from "../../middleware/admin.middleware.ts";
import {
  listAllInvestmentsHandler,
  payoutInvestmentHandler,
} from "./investments.controller.ts";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listAllInvestmentsHandler);
router.patch("/:id/payout", payoutInvestmentHandler);

export default router;
