import { Router } from "express";
import { AuthController } from "./auth.controller";
const router: Router = Router();

// TODO: Implementar endpoint POST /api/auth/login (RF-01, RF-02)
router.post("/login", AuthController.loginOfUserFromController);
router.post("/register", AuthController.RegisterNewUserFromController);
export default router;
