import { Router } from "express";
import { loginHandler, signupHandler } from "./auth.controller.ts";
import { validate } from "../../middleware/validate.middleware.ts";
import { loginSchema, signupSchema } from "./auth.types.ts";

const router = Router();

router.post("/signup", validate(signupSchema), signupHandler);
router.post("/login", validate(loginSchema), loginHandler);
export default router;
