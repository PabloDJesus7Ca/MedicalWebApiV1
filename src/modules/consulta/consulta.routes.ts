import { Router } from "express";
import { checkRoleMiddleware, authMiddleware } from "../../Shared/middlewares/auth.middleware";
import { Rol } from "../../generated/prisma";
const router: Router = Router();

// TODO: Implementar rutas de consulta diagnóstica e historial (RF-13 a RF-19)
// router.post("/", ConsultaController.consultar);
// router.get(
//   "/historial",
//   authMiddleware,
//   checkRoleMiddleware(Rol.DOCTOR),
//   ConsultaController.obtenerHistorial
// );

export default router;
