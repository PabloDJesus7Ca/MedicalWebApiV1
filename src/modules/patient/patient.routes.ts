import { Router } from "express";
import { PacientesController } from "./patient.controller";
import { checkRoleMiddleware, middlewareAuth } from "@shared/middleware/auth.middleware";
import { Rol } from "@generated/prisma/index.js";
import { validationRequest } from "@shared/middleware/validation.middleware";
import { CreateLaboratorioSchema, CreatePacienteSchema, UpdatePacienteSchema } from "./patient.dto";

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
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: Juan Pérez
 *               edad:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 130
 *                 example: 35
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *                 example: M
 *               documento:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 20
 *                 example: 40212345
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
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
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
router.post(
  "/",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(CreatePacienteSchema),
  PacientesController.create
);

/**
 * @swagger
 * /pacientes:
 *   get:
 *     summary: Lista todos los pacientes (soporta búsqueda por nombre o documento). Retorna solo pacientes activos (excluye borrados lógicamente).
 *     description: |
 *       **Filtro por Roles:** Los médicos (`DOCTOR`) solo verán en la lista a los pacientes que ellos mismos registraron. Los administradores (`ADMIN`) obtienen la lista completa del hospital.
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
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
router.get("/", middlewareAuth, checkRoleMiddleware(Rol.DOCTOR), PacientesController.list);

/**
 * @swagger
 * /pacientes/{id}:
 *   get:
 *     summary: Obtiene un paciente por su ID
 *     description: |
 *       **Filtro por Roles:** Si el usuario es `DOCTOR`, solo podrá obtener pacientes que él mismo haya registrado. Intentar obtener un paciente de otro médico retornará un error.
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
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 */
router.get("/:id", middlewareAuth, checkRoleMiddleware(Rol.DOCTOR), PacientesController.getById);

/**
 * @swagger
 * /pacientes/{id}:
 *   put:
 *     summary: Actualiza los datos de un paciente
 *     description: |
 *       **Filtro por Roles:** Si el usuario es `DOCTOR`, solo podrá editar pacientes que él mismo haya registrado.
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
 *                 minLength: 3
 *                 maxLength: 100
 *               edad:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 130
 *               sexo:
 *                 type: string
 *                 enum: [M, F]
 *               documento:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 20
 *     responses:
 *       200:
 *         description: Paciente actualizado correctamente
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
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 */
router.put(
  "/:id",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(UpdatePacienteSchema),
  PacientesController.update
);

/**
 * @swagger
 * /pacientes/{id}:
 *   delete:
 *     summary: Elimina un paciente por su ID (Soft-Delete)
 *     description: |
 *       Realiza un borrado lógico (cambia el campo activo a false) en lugar de un borrado físico, para cumplir con las normativas de retención de datos médicos (HIPAA/GDPR). El paciente desaparecerá de las listas pero sus datos históricos se mantendrán protegidos en la base de datos.
 *       **Filtro por Roles:** Si el usuario es `DOCTOR`, solo podrá eliminar pacientes que él mismo haya registrado.
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
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 */
router.delete("/:id", middlewareAuth, checkRoleMiddleware(Rol.DOCTOR), PacientesController.delete);

/**
 * @swagger
 * /pacientes/{id}/laboratorio:
 *   post:
 *     summary: Agrega un resultado de laboratorio a un paciente
 *     description: |
 *       **Filtro por Roles:** Si el usuario es `DOCTOR`, solo podrá agregar resultados a pacientes que él mismo haya registrado.
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
 *                 minLength: 3
 *                 example: Glucosa en sangre
 *               resultado:
 *                 type: string
 *                 minLength: 1
 *                 example: 95 mg/dL - Normal
 *     responses:
 *       201:
 *         description: Resultado de laboratorio registrado
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
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 */
router.post(
  "/:id/laboratorio",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(CreateLaboratorioSchema),
  PacientesController.addLaboratorio
);

/**
 * @swagger
 * /pacientes/{id}/expediente:
 *   get:
 *     summary: Obtiene el expediente clínico completo de un paciente (datos, laboratorios y consultas IA)
 *     description: |
 *       **Filtro por Roles:** Si el usuario es `DOCTOR`, solo podrá ver expedientes de pacientes que él mismo haya registrado.
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
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 */
router.get(
  "/:id/expediente",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  PacientesController.getExpediente
);

export default router;
