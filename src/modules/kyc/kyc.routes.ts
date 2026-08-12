import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { submitKycSchema } from "./kyc.types.ts";
import { submitKycHandler, getMyKycStatusHandler } from "./kyc.controller.ts";

const router = Router();

router.post("/", requireAuth, validate(submitKycSchema), submitKycHandler);
router.get("/", requireAuth, getMyKycStatusHandler);

export default router;
