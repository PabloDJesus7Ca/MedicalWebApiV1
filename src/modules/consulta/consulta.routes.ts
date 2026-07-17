import { Router } from "express";
import { ConsultaController } from "./consulta.controller";
import { authMiddleware, checkRoleMiddleware } from "../../Shared/middlewares/auth.middleware";
import { ConsultaLimiter } from "../../Shared/middlewares/rateLimit.middleware";
import { Rol } from "../../generated/prisma";

const router: Router = Router();

/**
 * @swagger
 * /consulta:
 *   post:
 *     summary: Crea una nueva consulta diagnóstica con IA
 *     description: |
 *       **Cómo funciona:**
 *       Este endpoint recibe los síntomas del paciente y consulta su historial clínico (consultas previas y laboratorios) en la base de datos. Luego envía toda esa información a la IA (Gemini) usando un System Prompt estructurado.
 *
 *       **Qué hace:**
 *       Genera un análisis médico automatizado que incluye diagnósticos diferenciales ordenados por probabilidad, nivel de riesgo individual, justificaciones clínicas basadas en el historial, signos de alarma y recomendaciones. La API está protegida por un Rate Limiter (máx. 30 consultas por hora por usuario).
 *
 *       **Cómo probarlo:**
 *       1. Autentícate en `/auth/login` y usa el JWT como Bearer Token.
 *       2. Asegúrate de que el `pacienteId` exista (puedes crearlo en `/pacientes`).
 *       3. Envía el payload con el ID del paciente y sus síntomas actuales.
 *     tags:
 *       - Consulta
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pacienteId
 *               - input
 *             properties:
 *               pacienteId:
 *                 type: integer
 *                 description: ID del paciente asociado
 *                 example: 1
 *               input:
 *                 type: string
 *                 description: Síntomas y datos clínicos del paciente
 *                 example: "Paciente de 55 años acude con dolor opresivo en el pecho que se irradia hacia el brazo izquierdo, sudoración fría y mareos desde hace 45 minutos."
 *     responses:
 *       201:
 *         description: Consulta creada exitosamente. Retorna el análisis de la IA en formato JSON estructurado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 doctorId:
 *                   type: integer
 *                 pacienteId:
 *                   type: integer
 *                 input:
 *                   type: string
 *                 output:
 *                   type: object
 *                   description: JSON estructurado y limpio generado por la IA.
 *                   properties:
 *                     diagnosticos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           enfermedad:
 *                             type: string
 *                           probabilidad:
 *                             type: integer
 *                           nivelRiesgo:
 *                             type: string
 *                           explicacion:
 *                             type: string
 *                     recomendaciones:
 *                       type: string
 *                     signosAlarma:
 *                       type: array
 *                       items:
 *                         type: string
 *                     nivelUrgencia:
 *                       type: string
 *                 nivelRiesgo:
 *                   type: string
 *                   enum: [Alto, Medio, Bajo]
 *                 modelo:
 *                   type: string
 *                 promptVersion:
 *                   type: string
 *                 tokens:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 paciente:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     documento:
 *                       type: string
 *       400:
 *         description: Datos inválidos (pacienteId no numérico, input vacío)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error al procesar la consulta con la IA
 *       429:
 *         description: Demasiadas solicitudes (límite de 30 por hora superado)
 */
router.post(
  "/",
  authMiddleware,
  ConsultaLimiter,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.consultar
);

/**
 * @swagger
 * /consulta/historial:
 *   get:
 *     summary: Obtiene el historial de consultas de IA del médico autenticado
 *     description: Retorna consultas. Por defecto solo las del médico autenticado. Si se pasa all=true, retorna todas las del sistema (para doctores con acceso general). Admite filtros opcionales por paciente, rango de fechas y paginación.
 *     tags:
 *       - Consulta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pacienteId
 *         schema:
 *           type: integer
 *         description: Filtra el historial por un paciente específico.
 *         example: 1
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha mínima (inclusive) en formato ISO, ej. 2026-07-01.
 *         example: "2026-07-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha máxima (inclusive) en formato ISO, ej. 2026-07-31.
 *         example: "2026-07-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: all
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Si es "true", omite el filtro por doctor y retorna todas las consultas del sistema
 *         example: "true"
 *     responses:
 *       200:
 *         description: Historial de consultas del médico autenticado (paginado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       pacienteId:
 *                         type: integer
 *                       input:
 *                         type: string
 *                       output:
 *                         type: string
 *                       nivelRiesgo:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       paciente:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           documento:
 *                             type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       400:
 *         description: Filtros inválidos (pacienteId no numérico o fechas mal formadas)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 */
router.get(
  "/historial",
  authMiddleware,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.obtenerHistorial
);

/**
 * @swagger
 * /consulta/{id}:
 *   get:
 *     summary: Obtiene una consulta por su ID
 *     description: Retorna los detalles completos de una consulta diagnóstica, incluyendo datos del paciente y del doctor.
 *     tags:
 *       - Consulta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consulta
 *         example: 1
 *     responses:
 *       200:
 *         description: Datos de la consulta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 doctorId:
 *                   type: integer
 *                 pacienteId:
 *                   type: integer
 *                 input:
 *                   type: string
 *                 output:
 *                   type: string
 *                 nivelRiesgo:
 *                   type: string
 *                 modelo:
 *                   type: string
 *                 promptVersion:
 *                   type: string
 *                 tokens:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 paciente:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     documento:
 *                       type: string
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Consulta no encontrada
 */
/**
 * @swagger
 * /consulta/{id}:
 *   put:
 *     summary: Actualiza los síntomas o diagnóstico de una consulta
 *     description: Permite editar el input (síntomas) y/o output (diagnóstico) de una consulta existente.
 *     tags:
 *       - Consulta
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la consulta
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *                 description: Nuevos síntomas y datos clínicos
 *                 example: "Paciente de 50 años con cefalea intensa y visión borrosa."
 *               output:
 *                 type: string
 *                 description: Nuevo diagnóstico
 *     responses:
 *       200:
 *         description: Consulta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 input:
 *                   type: string
 *                 output:
 *                   type: string
 *                 paciente:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     documento:
 *                       type: string
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: ID inválido o body vacío
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario autenticado no tiene rol DOCTOR
 *       404:
 *         description: Consulta no encontrada
 */
router.put(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.actualizarConsulta
);

router.get(
  "/:id",
  authMiddleware,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.obtenerConsulta
);

export default router;
