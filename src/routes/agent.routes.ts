import { Router } from "express";
import { UserControllerAi } from "../controllers/consult.response.ai.controller";
import { authMiddleware, checkRoleMiddleware } from "../Shared/middlewares/auth.middleware";
import { Rol } from "../generated/prisma";
const routes: Router = Router();

/**
 * @swagger
 * /chat:
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
 */
routes.post("/chat", authMiddleware, checkRoleMiddleware(Rol.DOCTOR), UserControllerAi.Chat);

export default routes;
