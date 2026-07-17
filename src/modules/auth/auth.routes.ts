import { Router } from "express";
import { AuthController } from "./auth.controller";
import { LoginLimiter } from "../../Shared/middlewares/rateLimit.middleware";
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
 *       Este endpoint está protegido contra ataques de fuerza bruta. El sistema bloqueará automáticamente las peticiones de una misma dirección IP si se superan los **5 intentos fallidos o exitosos en un periodo de 15 minutos**, retornando un error `429 Too Many Requests`.
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
 *         description: Email o contraseña incorrectos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Esta Contrasena Es Incorrecta
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
 *                 error:
 *                   type: string
 *                   example: Error details
 *                 code:
 *                   type: string
 *                   example: ERR_500
 *       429:
 *         description: Demasiadas solicitudes (límite de 5 intentos por 15 minutos superado)
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Estamos experimentando muchas solicitudes desde esta IP, por favor intente más tarde.
 */
router.post("/login", LoginLimiter, AuthController.loginOfUserFromController);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra un nuevo usuario en el sistema
 *     description: Registra una nueva cuenta de usuario (médico o administrador). Una vez creado el usuario, se debe llamar al endpoint `/auth/login` con las credenciales registradas para obtener el token JWT necesario para realizar peticiones autenticadas.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: doctor@hospital.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: MiPassword123
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, DOCTOR]
 *                 example: DOCTOR
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 NewUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     nombre:
 *                       type: string
 *                       example: Juan Pérez
 *                     email:
 *                       type: string
 *                       example: doctor@hospital.com
 *                     rol:
 *                       type: string
 *                       example: DOCTOR
 *       400:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Este Cuenta Ya Existe Ha Sido Tomada Por Un Usuario
 *       500:
 *         description: Error desconocido del servidor
 */
router.post("/register", AuthController.RegisterNewUserFromController);

export default router;
