import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { listBalancesHandler } from "./balances.controller.ts";

const router = Router();

router.get("/", requireAuth, listBalancesHandler);

export default router;
