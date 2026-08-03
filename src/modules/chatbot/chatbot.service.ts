import { ai, type GenerateContentConfig } from "@shared/utils/ai.helper";
import { prisma } from "@/config/lib/prisma";
import { AskQuestionDto } from "./chatbot.dto";
import { logAudit } from "@shared/utils/audit.helper";

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
      throw new Error(
        "Acceso denegado. No tienes los permisos necesarios para acceder a esta consulta."
      );
    }

    const config = await prisma.config.findFirst();
    const modelName = config?.modelName ?? "gemini-3.5-flash";
    const temperatura = config?.temperatura ?? 0.1;
    const maxTokens = config?.maxTokens ?? 4000;

    const context = `Paciente: ${consulta.paciente.nombre} (Doc: ${consulta.paciente.documento})\n\nSíntomas registrados:\n${consulta.input}\n\nDiagnóstico emitido:\n${consulta.output}\n\n---\n\nResponde la siguiente pregunta del médico basándote en el contexto clínico de esta consulta:\n\n${dto.question}`;

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
    const tokens = response.usageMetadata?.totalTokenCount ?? 0;

    const chatbotAnswer = await prisma.chatbotAnswer.create({
      data: {
        consultaId: dto.consultaId,
        question: dto.question,
        answer,
        tokens,
      },
    });

    await prisma.consulta.update({
      where: { id: dto.consultaId },
      data: { tokens: { increment: tokens } },
    });

    await logAudit(
      doctorId,
      "CONSULTA_AI",
      "ChatbotAnswer",
      chatbotAnswer.id,
      `Pregunta sobre consulta #${dto.consultaId} (${tokens} tokens)`
    );

    return { answer, tokens };
  }
}
