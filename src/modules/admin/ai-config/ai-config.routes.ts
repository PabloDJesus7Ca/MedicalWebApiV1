import { Router } from "express";
import { IaConfigController } from "./ai-config.controller";
import { checkRoleMiddleware, middlewareAuth } from "@shared/middleware/auth.middleware";
import { Rol } from "@generated/prisma/index.js";
import { validationRequest } from "@shared/middleware/validation.middleware";
import {
  CreatePromptVersionSchema,
  UpdateConfigSchema,
  UpdatePromptVersionSchema,
} from "./ai-config.dto";

const router: Router = Router();

/**
 * @swagger
 * /admin/configSystem:
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
 *                 configSystem:
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

/**
 * @swagger
 * /admin/configSystem/models:
 *   get:
 *     summary: Lista los modelos de Inteligencia Artificial disponibles
 *     description: Consulta a la API de Gemini y retorna un listado con los nombres de los modelos disponibles y compatibles para procesar consultas médicas. Solo accesible por administradores.
 *     tags: [Admin - IA Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modelos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 models:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"]
 *       401:
 *         description: No autenticado, falta token JWT o expiró
 *       403:
 *         description: No tiene rol ADMIN para acceder a la configuración del sistema
 *       500:
 *         description: Error interno al comunicarse con el proveedor de IA
 */
router.get(
  "/models",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  IaConfigController.listModels
);

router.get("/", middlewareAuth, checkRoleMiddleware(Rol.ADMIN), IaConfigController.getConfig);

/**
 * @swagger
 * /admin/configSystem:
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
 *                 example: "gemini-3.6-flash"
 *               maxTokens:
 *                 type: integer
 *                 maximum: 8192
 *                 example: 4000
 *               temperatura:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 2
 *                 example: 0.1
 *               systemPrompt:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Configuración actualizada
 *       400:
 *         description: Error de validación en los datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 *       500:
 *         description: Error interno al actualizar la configuración
 */
router.put(
  "/",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  validationRequest(UpdateConfigSchema),
  IaConfigController.updateConfig
);

/**
 * @swagger
 * /admin/configSystem/prompt-versions:
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
 *                 minLength: 1
 *                 example: "v1.1"
 *               contenido:
 *                 type: string
 *                 minLength: 10
 *               activo:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Versión creada
 *       400:
 *         description: Error de validación en los datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.get(
  "/prompt-versions",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  IaConfigController.listPromptVersions
);
router.post(
  "/prompt-versions",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  validationRequest(CreatePromptVersionSchema),
  IaConfigController.createPromptVersion
);

/**
 * @swagger
 * /admin/configSystem/prompt-versions/{id}:
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
 *                 minLength: 1
 *               contenido:
 *                 type: string
 *                 minLength: 10
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Versión actualizada
 *       400:
 *         description: Error de validación
 *       404:
 *         description: No encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No tiene rol ADMIN
 */
router.put(
  "/prompt-versions/:id",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  validationRequest(UpdatePromptVersionSchema),
  IaConfigController.updatePromptVersion
);

/**
 * @swagger
 * /admin/configSystem/prompt-versions/{id}/activate:
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
router.put(
  "/prompt-versions/:id/activate",
  middlewareAuth,
  checkRoleMiddleware(Rol.ADMIN),
  IaConfigController.activatePromptVersion
);

export default router;
