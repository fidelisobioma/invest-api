import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { createInvestmentSchema } from "./investments.types.ts";
import {
  listPlansHandler,
  createInvestmentHandler,
  listMyInvestmentsHandler,
} from "./investments.controller.ts";

const plansRouter = Router();
plansRouter.get("/", listPlansHandler);

const investmentsRouter = Router();
investmentsRouter.post(
  "/",
  requireAuth,
  validate(createInvestmentSchema),
  createInvestmentHandler,
);
investmentsRouter.get("/", requireAuth, listMyInvestmentsHandler);

export { plansRouter, investmentsRouter };
