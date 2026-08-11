import { Router } from "express";
import { ChatbotController } from "./chatbot.controller";
import { checkRoleMiddleware, middlewareAuth } from "@shared/middleware/auth.middleware";
import { Rol } from "@generated/prisma/index.js";
import { validationRequest } from "@shared/middleware/validation.middleware";
import { AskQuestionSchema } from "./chatbot.dto";

const router: Router = Router();

/**
 * @swagger
 * /chatbot/ask:
 *   post:
 *     summary: Realiza una pregunta sobre una consulta al asistente IA
 *     description: Envía una pregunta del médico sobre el contexto de una consulta existente y retorna una respuesta generada por IA. Solo accesible por usuarios con rol DOCTOR.
 *     tags:
 *       - Chatbot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultaId
 *               - question
 *             properties:
 *               consultaId:
 *                 type: integer
 *                 description: ID de la consulta sobre la que se pregunta
 *                 example: 1
 *               question:
 *                 type: string
 *                 minLength: 5
 *                 description: Pregunta del médico sobre el caso clínico
 *                 example: "¿Qué exámenes de laboratorio recomendaría para este paciente?"
 *     responses:
 *       200:
 *         description: Respuesta generada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: Respuesta del asistente IA
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
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
router.post(
  "/ask",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(AskQuestionSchema),
  ChatbotController.ask
);

export default router;
