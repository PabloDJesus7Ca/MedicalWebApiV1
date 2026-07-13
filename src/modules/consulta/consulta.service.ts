import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { prisma } from "../../configurations/lib/prisma";
import { apiKeys } from "../../configurations/configs";
import { HistorialFiltersDto, CreateConsultaDto, UpdateConsultaDto } from "./consulta.dto";
import { logAudit } from "../../Shared/utils/audit.helper";

const ai = new GoogleGenAI({ apiKey: apiKeys.NAMEAPYKEY });

export class ConsultaService {
  static async crearConsulta(doctorId: number, dto: CreateConsultaDto) {
    const config = await prisma.config.findFirst();
    const modelName = config?.modelName ?? "gemini-2.5-flash";
    const temperatura = config?.temperatura ?? 0.1;
    const maxTokens = config?.maxTokens ?? 4000;
    const systemPrompt = config?.systemPrompt ?? "";

    const promptVersion = await prisma.promptVersion.findFirst({ where: { activo: true } });

    const payload = `Paciente ID: ${dto.pacienteId}\n\nSíntomas y datos clínicos:\n${dto.input}\n\n---\nEvalúa el nivel de riesgo del paciente (Alto, Medio o Bajo) y al final de tu respuesta incluye la línea exacta:\nNIVEL_RIESGO: [Alto|Medio|Bajo]`;

    const configPayload: Record<string, unknown> = {
      temperature: temperatura,
      maxOutputTokens: maxTokens,
    };
    if (systemPrompt) {
      configPayload.systemInstruction = systemPrompt;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: payload,
      config: configPayload as GenerateContentConfig,
    });

    const output = response.text ?? "";
    let nivelRiesgo = "Bajo";
    const match = output.match(/NIVEL_RIESGO:\s*(Alto|Medio|Bajo)/i);
    if (match?.[1]) {
      nivelRiesgo = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
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

    await logAudit(doctorId, "CONSULTA_AI", "Consulta", consulta.id, `Consulta IA para paciente #${dto.pacienteId}`);

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

    await logAudit(doctorId, "UPDATE", "Consulta", consultaId, `Consulta #${consultaId} actualizada`);

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
      doctorId,
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
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.consulta.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}
