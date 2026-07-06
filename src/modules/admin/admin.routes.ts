import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authMiddleware, checkRoleMiddleware } from "../../Shared/middlewares/auth.middleware";
import { Rol } from "../../generated/prisma";

const router: Router = Router();

// TODO: Implementar rutas de logs de auditoría y configuración de IA (RF-25 a RF-28)
// router.get("/logs", authMiddleware, checkRoleMiddleware(Rol.ADMIN), AdminController.listLogs);

/**
 * @swagger
 * /admin/usuarios:
 *   post:
 *     summary: Crea un nuevo usuario (médico o administrador)
 *     description: Solo un administrador puede crear usuarios. Un médico autenticado recibe 403 al intentar acceder a este endpoint.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
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
 *                 example: Ana Gómez
 *               email:
 *                 type: string
 *                 example: ana.gomez@hospital.com
 *               password:
 *                 type: string
 *                 example: ClaveSegura123
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, DOCTOR]
 *                 example: DOCTOR
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El email ya está registrado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol ADMIN
 */
router.post("/", authMiddleware, checkRoleMiddleware(Rol.ADMIN), AdminController.crearUsuario);

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     summary: Lista todos los usuarios del sistema
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios (sin contraseñas)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol ADMIN
 */
router.get("/", authMiddleware, checkRoleMiddleware(Rol.ADMIN), AdminController.listarUsuarios);

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: El usuario autenticado no tiene rol ADMIN
 */
router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(Rol.ADMIN),
  AdminController.obtenerUsuarioPorId
);

/**
 * @swagger
 * /admin/usuarios/{id}:
 *   put:
 *     summary: Edita o desactiva un usuario existente
 *     description: "Para desactivar un usuario, enviar el campo activo en false en el cuerpo de la petición."
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, DOCTOR]
 *               activo:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       403:
 *         description: El usuario autenticado no tiene rol ADMIN
 */
router.put(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(Rol.ADMIN),
  AdminController.actualizarUsuario
);

export default router;
