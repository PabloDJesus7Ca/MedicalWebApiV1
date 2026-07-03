import { Router } from "express";
import { UsuariosControl } from "./usuarios.controller";
const router: Router = Router();

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos del usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
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
 *         description: ID de usuario inválido o no proporcionado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error desconocido
 */
router.get("/:id", UsuariosControl.GetUserByIdFoundFromControl);

export default router;