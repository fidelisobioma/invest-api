import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { getBalanceHandler } from "./balances.controller.ts";

const router = Router();

router.get("/", requireAuth, getBalanceHandler);

export default router;
