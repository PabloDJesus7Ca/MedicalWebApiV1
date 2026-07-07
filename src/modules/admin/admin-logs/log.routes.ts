import { Router } from "express";
import { authMiddleware, checkRoleMiddleware } from "../../../Shared/middlewares/auth.middleware";
import { Rol } from "../../../generated/prisma";
import { LogsController } from "./log.controller";

const router: Router = Router();

router.get("/", authMiddleware, checkRoleMiddleware(Rol.ADMIN), LogsController.listLogs);
// TODO: Implementar rutas de logs de auditoría y configuración de IA (RF-25 a RF-28)

export default router;
