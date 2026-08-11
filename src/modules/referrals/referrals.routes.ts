import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { getReferralSummaryHandler } from "./referrals.controller.ts";

const router = Router();

router.get("/", requireAuth, getReferralSummaryHandler);

export default router;
