import { Router } from "express";
import { ConsultaController } from "./consulta.controller";
import { authMiddleware, checkRoleMiddleware } from "../../Shared/middlewares/auth.middleware";
import { Rol } from "../../generated/prisma";

const router: Router = Router();

// TODO: Implementar ruta de creación de consulta diagnóstica (RF-13 a RF-18)
// router.post("/", authMiddleware, checkRoleMiddleware(Rol.DOCTOR), ConsultaController.consultar);

/**
 * @swagger
 * /consulta/historial:
 *   get:
 *     summary: Obtiene el historial de consultas de IA del médico autenticado
 *     description: Solo retorna las consultas cuyo médico coincide con el usuario autenticado. Admite filtros opcionales por paciente y por rango de fechas.
 *     tags:
 *       - Consulta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pacienteId
 *         schema:
 *           type: integer
 *         description: Filtra el historial por un paciente específico.
 *         example: 1
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha mínima (inclusive) en formato ISO, ej. 2026-07-01.
 *         example: "2026-07-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha máxima (inclusive) en formato ISO, ej. 2026-07-31.
 *         example: "2026-07-31"
 *     responses:
 *       200:
 *         description: Historial de consultas del médico autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historial:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       pacienteId:
 *                         type: integer
 *                       input:
 *                         type: string
 *                       output:
 *                         type: string
 *                       nivelRiesgo:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Filtros inválidos (pacienteId no numérico o fechas mal formadas)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
router.get(
  "/historial",
  authMiddleware,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.obtenerHistorial
);

export default router;
