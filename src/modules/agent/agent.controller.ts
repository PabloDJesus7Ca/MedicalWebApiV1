import { Response } from "express";
import { utilsFormatPrompt } from "@shared/utils/prompt.helper";
import main from "@modules/agent/agent.structure";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { logAudit } from "@shared/utils/audit.helper";

import { ChatAgentSchema } from "./agent.dto";
import { ZodError } from "zod";
import { formatAiError } from "@shared/utils/ai.helper";

export class UserControllerAi {
  static async Chat(request: AuthRequest, response: Response) {
    try {
      const { pregunta } = ChatAgentSchema.parse(request.body);

      const prompt = utilsFormatPrompt(pregunta);
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
      if (error instanceof ZodError) {
        return response
          .status(400)
          .json({ ProcessError: error.issues[0]?.message || "Datos inválidos" });
      }
      const safeMessage = formatAiError(error);
      return response.status(503).json({ ProcessError: safeMessage });
    }
  }
}
