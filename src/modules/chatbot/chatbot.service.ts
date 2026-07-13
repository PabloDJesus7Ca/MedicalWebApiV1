import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import { prisma } from "../../configurations/lib/prisma";
import { apiKeys } from "../../configurations/configs";
import { AskQuestionDto } from "./chatbot.dto";
import { logAudit } from "../../Shared/utils/audit.helper";

const ai = new GoogleGenAI({ apiKey: apiKeys.NAMEAPYKEY });

export class ChatbotService {
  static async askQuestion(doctorId: number, dto: AskQuestionDto) {
    const consulta = await prisma.consulta.findUnique({
      where: { id: dto.consultaId },
      include: {
        paciente: { select: { nombre: true, documento: true } },
      },
    });
    if (!consulta) {
      throw new Error("Consulta no encontrada.");
    }
    if (consulta.doctorId !== doctorId) {
      throw new Error("No tienes permiso para acceder a esta consulta.");
    }

    const config = await prisma.config.findFirst();
    const modelName = config?.modelName ?? "gemini-2.5-flash";
    const temperatura = config?.temperatura ?? 0.1;
    const maxTokens = config?.maxTokens ?? 4000;

    const context = `Paciente: ${consulta.paciente.nombre} (Doc: ${consulta.paciente.documento})\n\nSíntomas registrados:\n${consulta.input}\n\nDiagnóstico emitido:\n${consulta.output}\n\n---\n\nResponde la siguiente pregunta del médico basándote exclusivamente en el contexto clínico de esta consulta:\n\n${dto.question}`;

    const configPayload: Record<string, unknown> = {
      temperature: temperatura,
      maxOutputTokens: maxTokens,
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: context,
      config: configPayload as GenerateContentConfig,
    });

    const answer = response.text ?? "";

    const chatbotAnswer = await prisma.chatbotAnswer.create({
      data: {
        consultaId: dto.consultaId,
        question: dto.question,
        answer,
      },
    });

    await logAudit(doctorId, 'CONSULTA_AI', 'ChatbotAnswer', chatbotAnswer.id, `Pregunta sobre consulta #${dto.consultaId}`);

    return { answer };
  }
}
