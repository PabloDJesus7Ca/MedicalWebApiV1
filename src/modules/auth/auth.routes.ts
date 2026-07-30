import { Router } from "express";
import { AuthController } from "./auth.controller";
import { LoginLimiter } from "@shared/middleware/rate-limit.middleware";
import { validationRequest } from "@shared/middleware/validation.middleware";
import { CheckTypeLoginSchema } from "./auth.dto";

const router: Router = Router();

// TODO: Implementar endpoint POST /api/auth/login (RF-01, RF-02)

/** @swagger
 * /auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario existente
 *     description: |
 *       Retorna un token JWT válido tras un inicio de sesión exitoso. Este token debe incluirse en la cabecera `Authorization` con el formato `Bearer <token>` para autenticar las peticiones a los endpoints protegidos.
 *
 *       **Seguridad (Rate Limiting):**
 *       Este endpoint está protegido contra ataques de fuerza bruta. El sistema bloqueará automáticamente las peticiones de una misma dirección IP si se superan los **10 intentos fallidos o exitosos en un periodo de 15 minutos**, retornando un class `429 Too Many Requests`.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@hospital.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: MiPassword123
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente, devuelve el token JWT y el ID de usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Haz Iniciado Session Correctamente
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Error de validación en los datos enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error de validación en los datos enviados.
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       500:
 *         description: Error desconocido del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error al iniciar sesion
 *                 class:
 *                   type: string
 *                   example: Error details
 *                 code:
 *                   type: string
 *                   example: ERR_500
 *       429:
 *         description: Demasiadas solicitudes (límite de 10 intentos por 15 minutos superado)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Estamos experimentando muchas solicitudes desde esta IP, por favor intente más tarde.
 */
router.post("/login", LoginLimiter, validationRequest(CheckTypeLoginSchema), AuthController.loginOfUserFromController);

export default router;

