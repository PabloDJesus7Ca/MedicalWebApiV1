import { Router } from "express";
import { IaConfigController } from "./ia-config.controller";
import { authMiddleware, checkRoleMiddleware } from "../../../Shared/middlewares/auth.middleware";
import { Rol } from "../../../generated/prisma";

const router: Router = Router();

/**
 * @swagger
 * /admin/config:
 *   get:
 *     summary: Obtiene la configuración actual de la IA
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 config:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     modelName:
 *                       type: string
 *                     maxTokens:
 *                       type: integer
 *                     temperatura:
 *                       type: number
 *                     systemPrompt:
 *                       type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.get("/models", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.listModels);

router.get("/", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.getConfig);

/**
 * @swagger
 * /admin/config:
 *   put:
 *     summary: Actualiza la configuración de la IA
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *                 example: "gemini-2.5-flash"
 *               maxTokens:
 *                 type: integer
 *                 example: 4000
 *               temperatura:
 *                 type: number
 *                 example: 0.1
 *               systemPrompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.put("/", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.updateConfig);

/**
 * @swagger
 * /admin/config/prompt-versions:
 *   get:
 *     summary: Lista todas las versiones de prompt
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de versiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 versions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       version:
 *                         type: string
 *                       contenido:
 *                         type: string
 *                       activo:
 *                         type: boolean
 *                       creadoEn:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 *   post:
 *     summary: Crea una nueva versión de prompt
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - version
 *               - contenido
 *             properties:
 *               version:
 *                 type: string
 *                 example: "v1.1"
 *               contenido:
 *                 type: string
 *               activo:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Versión creada
 *       400:
 *         description: Error en los datos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.get("/prompt-versions", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.listPromptVersions);
router.post("/prompt-versions", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.createPromptVersion);

/**
 * @swagger
 * /admin/config/prompt-versions/{id}:
 *   put:
 *     summary: Actualiza una versión de prompt
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *               contenido:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Versión actualizada
 *       404:
 *         description: No encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.put("/prompt-versions/:id", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.updatePromptVersion);

/**
 * @swagger
 * /admin/config/prompt-versions/{id}/activate:
 *   put:
 *     summary: Activa una versión de prompt (desactiva las demás)
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Versión activada
 *       404:
 *         description: No encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.put("/prompt-versions/:id/activate", authMiddleware, checkRoleMiddleware(Rol.ADMIN), IaConfigController.activatePromptVersion);

export default router;
