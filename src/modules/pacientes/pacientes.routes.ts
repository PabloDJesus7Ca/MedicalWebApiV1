import { Router } from "express";
import { PacientesController } from "./pacientes.controller";
import { authMiddleware } from "../../Shared/middlewares/auth.middleware";

const router: Router = Router();

/**
 * @swagger
 * /pacientes:
 *   post:
 *     summary: Registra un nuevo paciente
 *     tags:
 *       - Pacientes
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
 *               - edad
 *               - sexo
 *               - documento
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               edad:
 *                 type: integer
 *                 example: 35
 *               sexo:
 *                 type: string
 *                 example: Masculino
 *               documento:
 *                 type: string
 *                 example: 40212345
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
 *       400:
 *         description: El documento ya está registrado
 *       401:
 *         description: No autenticado
 */
router.post("/", authMiddleware, PacientesController.create);

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Lista todos los pacientes (soporta búsqueda por nombre o documento)
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto parcial para filtrar por nombre o documento
 *         example: Juan
 *     responses:
 *       200:
 *         description: Lista de pacientes
 *       401:
 *         description: No autenticado
 */
router.get("/", authMiddleware, PacientesController.list);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Obtiene un paciente por su ID
 *     tags:
 *       - Pacientes
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
 *         description: Datos del paciente
 *       404:
 *         description: Paciente no encontrado
 */
router.get("/:id", authMiddleware, PacientesController.getById);

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Actualiza los datos de un paciente
 *     tags:
 *       - Pacientes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               edad:
 *                 type: integer
 *               sexo:
 *                 type: string
 *               documento:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente actualizado correctamente
 *       404:
 *         description: Paciente no encontrado
 */
router.put("/:id", authMiddleware, PacientesController.update);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Elimina un paciente por su ID
 *     tags:
 *       - Pacientes
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
 *         description: Paciente eliminado correctamente
 *       404:
 *         description: Paciente no encontrado
 */
router.delete("/:id", authMiddleware, PacientesController.delete);

/**
 * @swagger
 * /pacientes/{id}/laboratorio:
 *   post:
 *     summary: Agrega un resultado de laboratorio a un paciente
 *     tags:
 *       - Pacientes
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
 *             required:
 *               - descripcion
 *               - resultado
 *             properties:
 *               descripcion:
 *                 type: string
 *                 example: Glucosa en sangre
 *               resultado:
 *                 type: string
 *                 example: 95 mg/dL - Normal
 *     responses:
 *       201:
 *         description: Resultado de laboratorio registrado
 *       404:
 *         description: Paciente no encontrado
 */
router.post("/:id/laboratorio", authMiddleware, PacientesController.addLaboratorio);

/**
 * @swagger
 * /pacientes/{id}/expediente:
 *   get:
 *     summary: Obtiene el expediente clínico completo de un paciente (datos, laboratorios y consultas IA)
 *     tags:
 *       - Pacientes
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
 *         description: Expediente clínico completo
 *       404:
 *         description: Paciente no encontrado
 */
router.get("/:id/expediente", authMiddleware, PacientesController.getExpediente);

export default router;
