import { Router } from "express";
import { ConsultaController } from "./consultation.controller";
import { middlewareAuth, checkRoleMiddleware } from "@shared/middleware/auth.middleware";
import { ConsultaLimiter } from "@shared/middleware/rate-limit.middleware";
import { Rol } from "@generated/prisma/index.js";
import { validationRequest } from "@shared/middleware/validation.middleware";
import { CreateConsultaSchema, UpdateConsultaSchema } from "./consultation.dto";

const router: Router = Router();

/**
 * @swagger
 * /consulta:
 *   post:
 *     summary: Crea una nueva consulta diagnóstica con IA
 *     description: |
 *       **Cómo funciona:**
 *       Este endpoint recibe los síntomas del paciente y consulta su historial clínico en la base de datos. Para evitar alucinaciones de la IA y optimizar tokens, se inyectan únicamente las **últimas 5 consultas y 10 laboratorios**. Luego envía esta información a la IA (Gemini) usando un System Prompt estructurado. Además cuenta con validación estricta de Zod.
 *
 *       **Seguridad Clínica (IDOR) y Protección Financiera:**
 *       - **Rate Limit:** Protegido contra "Denial of Wallet" (máx. 100 consultas por hora por doctor).
 *       - **Privacidad (IDOR):** Solo puedes procesar consultas de pacientes que te pertenezcan, devolviendo un error 404 para aislar los historiales médicos entre doctores (salvo rol ADMIN).
 *       - **Auditoría:** Cada uso genera un registro auditable e inmutable vía Pino/Loki para cumplimiento HIPAA/GDPR.
 *
 *       **Qué hace:**
 *       Genera un análisis médico automatizado que incluye diagnósticos diferenciales ordenados por probabilidad, nivel de riesgo individual, justificaciones clínicas basadas en el historial, signos de alarma y recomendaciones.
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
 *                 minLength: 10
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
 *       500:
 *         description: Error al procesar la consulta con la IA
 *       429:
 *         description: Demasiadas solicitudes (límite de 100 por hora superado)
 */
router.post(
  "/",
  middlewareAuth,
  ConsultaLimiter,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(CreateConsultaSchema),
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
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.obtenerHistorial
);

/**
 * @swagger
 * /consulta/{id}:
 *   get:
 *     summary: Obtiene una consulta por su ID (Protegida por IDOR)
 *     description: Retorna los detalles completos de una consulta diagnóstica. Incluye protección IDOR, si un médico intenta acceder a una consulta que le pertenece a otro doctor, el sistema retornará un error 404 (Not Found) para proteger la privacidad del paciente. Los usuarios con rol ADMIN tienen acceso global.
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
 *                 minLength: 10
 *                 description: Nuevos síntomas y datos clínicos
 *                 example: "Paciente de 50 años con cefalea intensa y visión borrosa."
 *               output:
 *                 type: string
 *                 minLength: 10
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
 *         description: Consulta no encontrada
 */
router.put(
  "/:id",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  validationRequest(UpdateConsultaSchema),
  ConsultaController.actualizarConsulta
);

router.get(
  "/:id",
  middlewareAuth,
  checkRoleMiddleware(Rol.DOCTOR),
  ConsultaController.obtenerConsulta
);

export default router;
