import { Router } from "express";
import { UserControllerAi } from "../controllers/consult.response.ai.controller";
const routes: Router = Router();

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Chat que habla con la IA
 *     tags:
 *       - Ai
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
routes.post("/chat", UserControllerAi.Chat);

export default routes;
