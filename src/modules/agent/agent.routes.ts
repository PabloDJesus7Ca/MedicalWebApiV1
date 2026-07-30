import { Router } from "express";
import { UserControllerAi } from "@modules/agent/agent.controller";
import { middlewareAuth, checkRoleMiddleware } from "@shared/middleware/auth.middleware";
import { Rol } from "@/generated/prisma";
import { validationRequest } from "@shared/middleware/validation.middleware";
import { ChatAgentSchema } from "./agent.dto";
const routes: Router = Router();

/**
 * @swagger
 * /model/chat:
 *   post:
 *     summary: Chat que habla con la IA
 *     tags:
 *       - Ai
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pregunta:
 *                 type: string
 *                 example: Hola, ¿Me Duele La Cabeza y Tengo Fierbre y Mareos Desde hace 2 Semanas?
 *     responses:
 *       200:
 *         description: Respuesta de la IA
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
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
routes.post("/chat", middlewareAuth, checkRoleMiddleware(Rol.DOCTOR), validationRequest(ChatAgentSchema), UserControllerAi.Chat);

export default routes;
