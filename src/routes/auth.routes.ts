import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { registerSchema, loginSchema } from "../validators/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema, "body"), AuthController.register);
router.post("/login", validate(loginSchema, "body"), AuthController.login);
router.get("/me", authenticate(), AuthController.me);

export default router;
