import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.ts";
import { requireAdmin } from "../../middleware/admin.middleware.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { upsertWalletSchema, setWalletActiveSchema } from "./wallets.types.ts";
import {
  listWalletsHandler,
  upsertWalletHandler,
  setWalletActiveHandler,
} from "./wallets.controller.ts";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", listWalletsHandler);
router.put("/", validate(upsertWalletSchema), upsertWalletHandler);
router.patch(
  "/:id/active",
  validate(setWalletActiveSchema),
  setWalletActiveHandler,
);

export default router;
