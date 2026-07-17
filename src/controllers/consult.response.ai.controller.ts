import { Response } from "express";
import { formatPrompt } from "../Shared/utils/formatPrompt";
import main from "../Agent/model.ai.responses";
import { AuthRequest } from "../Shared/middlewares/auth.middleware";
import { logAudit } from "../Shared/utils/audit.helper";

export class UserControllerAi {
  static async Chat(request: AuthRequest, response: Response) {
    const { pregunta } = request.body;

    let promptInput = "";
    if (typeof pregunta === "string") {
      promptInput = pregunta;
    } else if (pregunta && typeof pregunta === "object") {
      const maybeSug = (pregunta).SugestAiAnswerDignostic;
      if (typeof maybeSug === "string") {
        promptInput = maybeSug;
      } else {
        const maybeText = (pregunta).text ?? (pregunta).message;
        if (typeof maybeText === "string") promptInput = maybeText;
      }
    }
    if (!promptInput || !promptInput.toString().trim()) {
      return response.status(400).json({ ProcessError: "Respuesta Faltante" });
    }

    try {
      const prompt = formatPrompt(promptInput);
      const consulta = await main(prompt);
      const cleanedResponse = formatPrompt(consulta ?? "");

      const doctorId = request.user?.id;
      if (doctorId) {
        await logAudit(
          doctorId,
          'CONSULTA_AI',
          "Consulta",
          undefined,
          "Consulta al asistente de IA vía /api/chat"
        );
      }

      return response.status(200).json(cleanedResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ ProcessError: error.message });
      }
      return response.status(500).json({ ProcessError: "Error Desconocido" });
    }
  }
}
