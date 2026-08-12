import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { requireAdmin } from "../../middleware/admin.middleware.ts";
import {
  validate,
  validateQuery,
} from "../../middleware/validate.middleware.ts";
import {
  listKycSubmissionsQuerySchema,
  reviewKycSchema,
  rejectKycSchema,
} from "./kyc.types.ts";
import {
  listKycSubmissionsHandler,
  approveKycHandler,
  rejectKycHandler,
} from "./kyc.controller.ts";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/",
  validateQuery(listKycSubmissionsQuerySchema),
  listKycSubmissionsHandler,
);
router.patch("/:id/approve", validate(reviewKycSchema), approveKycHandler);
router.patch("/:id/reject", validate(rejectKycSchema), rejectKycHandler);

export default router;
