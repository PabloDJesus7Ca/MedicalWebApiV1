import { ai, type GenerateContentConfig } from "../../Shared/utils/genai";
import { prisma } from "../../configurations/lib/prisma";
import { HistorialFiltersDto, CreateConsultaDto, UpdateConsultaDto } from "./consulta.dto";
import { logAudit } from "../../Shared/utils/audit.helper";
import { System } from "../../configurations/constant";

export class ConsultaService {
  static async crearConsulta(doctorId: number, dto: CreateConsultaDto) {
    const config = await prisma.config.findFirst();
    const modelName = config?.modelName ?? "gemini-3-flash-preview";
    const temperatura = config?.temperatura ?? 0.1;
    const maxTokens = config?.maxTokens ?? 4000;
    const systemPrompt = config?.systemPrompt ?? System;

    const promptVersion = await prisma.promptVersion.findFirst({ where: { activo: true } });

    // PASO 1: Buscar historial médico del paciente para incluirlo en el prompt (RF-18)
    const pacienteHistorial = await prisma.paciente.findUnique({
      where: { id: dto.pacienteId },
      include: {
        consultas: {
          orderBy: { createdAt: "desc" },
          take: 5, // Limitar a las últimas 5 para no saturar el prompt
          select: { createdAt: true, input: true, nivelRiesgo: true }, //No Traer outputs gigantes previos
        },
        laboratorios: {
          orderBy: { fecha: "desc" },
          take: 10,
        },
      },
    });

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

    // PASO 2: Construir el payload (User Prompt) solo con la data.
    // La estructura JSON y las reglas se definen en el systemPrompt.
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
      // El System Prompt define "nivelUrgencia" en lugar de "nivelRiesgoGeneral"
      if (parsedOutput.nivelUrgencia) {
        nivelRiesgo = parsedOutput.nivelUrgencia;
      }
    } catch (e) {

      const match = output.match(/"nivelUrgencia"\s*:\s*"(Alto|Medio|Bajo)"/i);
      if (match?.[1]) {
        nivelRiesgo = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      }
    }

    const tokens = response.usageMetadata?.totalTokenCount ?? 0;

    const consulta = await prisma.consulta.create({
      data: {
        doctorId,
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
      doctorId,
      "CONSULTA_AI",
      "Consulta",
      consulta.id,
      `Consulta IA para paciente #${dto.pacienteId}`
    );

    return consulta;
  }

  static async updateConsulta(consultaId: number, doctorId: number, dto: UpdateConsultaDto) {
    const consulta = await prisma.consulta.findUnique({ where: { id: consultaId } });
    if (!consulta) {
      throw new Error("Consulta no encontrada.");
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
      doctorId,
      "UPDATE",
      "Consulta",
      consultaId,
      `Consulta #${consultaId} actualizada`
    );

    return updated;
  }

  static async getConsultaById(consultaId: number) {
    const consulta = await prisma.consulta.findUnique({
      where: { id: consultaId },
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
      throw new Error("Consulta no encontrada.");
    }

    return consulta;
  }

  /**
   * Retorna el historial de consultas del médico autenticado, con filtros
   * opcionales por paciente y por rango de fechas.
   *
   * Solo se retornan consultas cuyo `doctorId` coincide con el médico autenticado:
   * un médico nunca puede ver el historial de consultas de otro médico.
   */
  static async getHistorialPorDoctor(doctorId: number, filtros: HistorialFiltersDto) {
    const page = filtros.page ?? 1;
    const pageSize = filtros.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const where = {
      ...(filtros.all ? {} : { doctorId }),
      ...(filtros.pacienteId ? { pacienteId: filtros.pacienteId } : {}),
      ...(filtros.fechaInicio || filtros.fechaFin
        ? {
            createdAt: {
              ...(filtros.fechaInicio ? { gte: filtros.fechaInicio } : {}),
              ...(filtros.fechaFin ? { lte: filtros.fechaFin } : {}),
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

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
