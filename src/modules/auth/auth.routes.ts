import { Router } from "express";
import { signupHandler } from "./auth.controller.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { signupSchema } from "./auth.types.ts";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);
export default router;
