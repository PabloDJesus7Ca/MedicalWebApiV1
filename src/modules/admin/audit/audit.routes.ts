import { Router } from "express";
import { checkRoleMiddleware, middlewareAuth } from "@shared/middleware/auth.middleware";
import { Rol } from "@/generated/prisma";
import { LogsController } from "./audit.controller";

const router: Router = Router();

/**
 * @swagger
 * /admin/logs:
 *   get:
 *     summary: Obtiene los logs de auditoría paginados
 *     description: Retorna los registros de auditoría del sistema con soporte de paginación y filtros por usuario, fecha y tipo de acción. Solo accesible por usuarios con rol ADMIN.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: usuario
 *         schema:
 *           type: string
 *         description: Filtro por nombre o email del usuario
 *         example: admin
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtro por fecha (YYYY-MM-DD)
 *         example: 2026-07-05
 *       - in: query
 *         name: tipoAccion
 *         schema:
 *           type: string
 *           enum: [CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, ERROR, AUTH_FAILED, CONSULTA_AI]
 *         description: Filtro por tipo de acción
 *         example: LOGIN
 *     responses:
 *       200:
 *         description: Lista paginada de logs de auditoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       accion:
 *                         type: string
 *                       entidad:
 *                         type: string
 *                       entidadId:
 *                         type: integer
 *                         nullable: true
 *                       detalle:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           email:
 *                             type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (se requiere rol ADMIN)
 *       500:
 *         description: Error al obtener logs
 */
router.get("/", middlewareAuth, checkRoleMiddleware(Rol.ADMIN), LogsController.listLogs);

/**
 * @swagger
 * /admin/logs/metricas:
 *   get:
 *     summary: Obtiene métricas generales del sistema
 *     description: Retorna el total de consultas realizadas, tokens consumidos por el modelo IA y cantidad de usuarios activos. Solo accesible por usuarios con rol ADMIN.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalConsultas:
 *                   type: integer
 *                   example: 1250
 *                 tokensConsumidos:
 *                   type: integer
 *                   example: 584200
 *                 usuariosActivos:
 *                   type: integer
 *                   example: 24
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (se requiere rol ADMIN)
 *       500:
 *         description: Error al obtener métricas
 */
router.get("/metricas", middlewareAuth, checkRoleMiddleware(Rol.ADMIN), LogsController.getMetricas);

export default router;
