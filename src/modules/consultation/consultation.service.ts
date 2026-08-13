import { ai, Type, getActiveAiConfig, type GenerateContentConfig } from "@shared/utils/ai.helper";
import { prisma } from "@/config/lib/prisma";
import { CreateConsultaDto, HistorialFiltersDto, UpdateConsultaDto } from "./consultation.dto";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

const inicioDeDia = (fecha: string) => {
  const [year = 0, month = 1, day = 1] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

const finDeDia = (fecha: string) => {
  const [year = 0, month = 1, day = 1] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
};

const parseConsultaOutput = <T extends Record<string, unknown> | null | undefined>(consulta: T): T => {
  if (!consulta || typeof (consulta as Record<string, unknown>).output !== "string") return consulta;
  try {
    return { ...consulta, output: JSON.parse((consulta as Record<string, unknown>).output as string) };
  } catch (_e) {
    return consulta;
  }
};

export class ConsultaService {
  static async crearConsulta(
    user: { id: number; rol: string; nombre?: string },
    dto: CreateConsultaDto
  ) {
    const { modelName, temperatura, maxTokens, systemPrompt } = await getActiveAiConfig();

    const promptVersion = await prisma.promptVersion.findFirst({ where: { activo: true } });

    const wherePaciente =
      user.rol === "ADMIN"
        ? { id: dto.pacienteId, activo: true }
        : { id: dto.pacienteId, creadoPorId: user.id, activo: true };
    const pacienteHistorial = await prisma.paciente.findFirst({
      where: wherePaciente,
      include: {
        consultas: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { createdAt: true, input: true, nivelRiesgo: true },
        },
        laboratorios: {
          orderBy: { fecha: "desc" },
          take: 10,
        },
      },
    });

    if (!pacienteHistorial) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    let historialTexto = "Sin historial médico previo.";
    if (pacienteHistorial) {
      const consultasTxt =
        pacienteHistorial.consultas.length > 0
          ? pacienteHistorial.consultas
              .map(
                (c) =>
                  `- Fecha: ${c.createdAt.toISOString().split("T")[0]}, Síntomas: ${c.input}, Riesgo anterior: ${c.nivelRiesgo}`
              )
              .join("\n")
          : "Sin consultas previas.";

      const labsTxt =
        pacienteHistorial.laboratorios.length > 0
          ? pacienteHistorial.laboratorios
              .map(
                (l) =>
                  `- Fecha: ${l.fecha.toISOString().split("T")[0]}, Prueba: ${l.descripcion}, Resultado: ${l.resultado}`
              )
              .join("\n")
          : "Sin laboratorios previos.";

      historialTexto = `Consultas previas:\n${consultasTxt}\n\nLaboratorios previos:\n${labsTxt}`;
    }

    const payload = `Paciente ID: ${dto.pacienteId}
Síntomas y datos clínicos actuales:
${dto.input}

Contexto Médico e Historial Previo:
${historialTexto}

---
Por favor, analiza esta información y genera tu respuesta basada en las instrucciones del sistema.`;

    const configPayload: Record<string, unknown> = {
      temperature: temperatura,
      maxOutputTokens: maxTokens,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnosticos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                enfermedad: { type: Type.STRING },
                probabilidad: { type: Type.NUMBER },
                nivelRiesgo: { type: Type.STRING },
                explicacion: { type: Type.STRING },
              },
              required: ["enfermedad", "probabilidad", "nivelRiesgo", "explicacion"],
            },
          },
          recomendaciones: { type: Type.STRING },
          signosAlarma: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          nivelUrgencia: { type: Type.STRING },
        },
        required: ["diagnosticos", "recomendaciones", "signosAlarma", "nivelUrgencia"],
      },
    };
    if (systemPrompt) {
      configPayload.systemInstruction = systemPrompt;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: payload,
      config: configPayload as GenerateContentConfig,
    });

    let rawOutput = response.text ?? "{}";
    rawOutput = rawOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const output = rawOutput;
    let nivelRiesgo = "Bajo";

    try {
      const parsedOutput = JSON.parse(output);
      if (parsedOutput.nivelUrgencia) {
        nivelRiesgo = parsedOutput.nivelUrgencia;
      }
    } catch (_e) {
      const match = output.match(/"nivelUrgencia"\s*:\s*"(Alto|Medio|Bajo)"/i);
      if (match?.[1]) {
        nivelRiesgo = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      }
    }

    const tokens = response.usageMetadata?.totalTokenCount ?? 0;

    const consulta = await prisma.consulta.create({
      data: {
        doctorId: user.id,
        pacienteId: dto.pacienteId,
        input: dto.input,
        output,
        nivelRiesgo,
        modelo: modelName,
        promptVersion: promptVersion?.version ?? "unknown",
        tokens,
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, documento: true },
        },
      },
    });

    await logAudit(
      user.id,
      "CONSULTA_AI",
      "Consulta",
      consulta.id,
      `Dr(a). ${user.nombre || user.id} procesó una consulta médica con IA para el paciente #${dto.pacienteId}`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "CONSULTA_AI",
        paciente_id: dto.pacienteId,
        consulta_id: consulta.id,
      },
      `Dr(a). ${user.nombre || user.id} procesó una consulta de IA.`
    );

    return parseConsultaOutput(consulta);
  }

  static async updateConsulta(
    consultaId: number,
    user: { id: number; rol: string; nombre?: string },
    dto: UpdateConsultaDto
  ) {
    const where = user.rol === "ADMIN" ? { id: consultaId } : { id: consultaId, doctorId: user.id };
    const consulta = await prisma.consulta.findFirst({ where });
    if (!consulta) {
      throw new Error("Consulta no encontrada o acceso denegado.");
    }

    const updated = await prisma.consulta.update({
      where: { id: consultaId },
      data: {
        ...(dto.input !== undefined ? { input: dto.input } : {}),
        ...(dto.output !== undefined ? { output: dto.output } : {}),
        ...(dto.completed !== undefined ? { completed: new Date(dto.completed) } : {}),
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, documento: true },
        },
        doctor: {
          select: { id: true, nombre: true, email: true },
        },
      },
    });

    await logAudit(
      user.id,
      "UPDATE",
      "Consulta",
      consultaId,
      `Dr(a). ${user.nombre || user.id} actualizó el diagnóstico de la consulta #${consultaId}`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "UPDATE_CONSULTA",
        consulta_id: consultaId,
      },
      `Dr(a). ${user.nombre || user.id} actualizó el diagnóstico de la consulta #${consultaId}.`
    );

    return parseConsultaOutput(updated);
  }

  static async getConsultaById(
    consultaId: number,
    user: { id: number; rol: string; nombre?: string }
  ) {
    const where = user.rol === "ADMIN" ? { id: consultaId } : { id: consultaId, doctorId: user.id };
    const consulta = await prisma.consulta.findFirst({
      where,
      include: {
        paciente: {
          select: { id: true, nombre: true, documento: true },
        },
        doctor: {
          select: { id: true, nombre: true, email: true },
        },
        chatbotAnswers: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!consulta) {
      throw new Error("Consulta no encontrada o acceso denegado.");
    }

    return parseConsultaOutput(consulta);
  }

  static async getHistorialPorDoctor(
    user: { id: number; rol: string; nombre?: string },
    filtros: HistorialFiltersDto
  ) {
    const page = filtros.page ?? 1;
    const pageSize = filtros.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(filtros.all && user.rol === "ADMIN" ? {} : { doctorId: user.id }),
      ...(filtros.pacienteId ? { pacienteId: filtros.pacienteId } : {}),
      ...(filtros.fechaInicio || filtros.fechaFin
        ? {
            createdAt: {
              ...(filtros.fechaInicio ? { gte: inicioDeDia(filtros.fechaInicio) } : {}),
              ...(filtros.fechaFin ? { lte: finDeDia(filtros.fechaFin) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.consulta.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          paciente: {
            select: { id: true, nombre: true, documento: true },
          },
          doctor: {
            select: { id: true, nombre: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.consulta.count({ where }),
    ]);

    return {
      data: data.map(parseConsultaOutput),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
