import { Response } from "express";
import { utilsFormatPrompt } from "@shared/utils/prompt.helper";
import main from "@modules/agent/agent.structure";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { logAudit } from "@shared/utils/audit.helper";

import { ChatAgentDto } from "./agent.dto";

export class UserControllerAi {
  static async Chat(request: AuthRequest, response: Response) {
    const { pregunta } = request.body as ChatAgentDto;

    let promptInput = "";
    if (typeof pregunta === "string") {
      promptInput = pregunta;
    } else if (pregunta && typeof pregunta === "object") {
      const maybeSug = pregunta.SugestAiAnswerDignostic;
      if (typeof maybeSug === "string") {
        promptInput = maybeSug;
      } else {
        const maybeText = pregunta.text ?? pregunta.message;
        if (typeof maybeText === "string") promptInput = maybeText;
      }
    }
    if (!promptInput || !promptInput.toString().trim()) {
      return response
        .status(400)
        .json({ ProcessError: "El campo de pregunta es requerido y no puede estar vacío." });
    }

    try {
      const prompt = utilsFormatPrompt(promptInput);
      const consulta = await main(prompt);
      const cleanedResponse = utilsFormatPrompt(consulta ?? "");

      const doctorId = request.user?.id;
      if (doctorId) {
        await logAudit(
          doctorId,
          "CONSULTA_AI",
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
      return response
        .status(500)
        .json({
          ProcessError: "Error interno al procesar la consulta con la inteligencia artificial.",
        });
    }
  }
}
