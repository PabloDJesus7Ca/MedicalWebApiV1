import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authMiddleware, checkRoleMiddleware } from "../../Shared/middlewares/auth.middleware";
import { Rol } from "../../generated/prisma";

const router: Router = Router();

router.get("/logs", authMiddleware, checkRoleMiddleware(Rol.ADMIN), AdminController.listLogs);

export default router;
