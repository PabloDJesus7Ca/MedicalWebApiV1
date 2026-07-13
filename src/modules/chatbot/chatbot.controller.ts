import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { ChatbotService } from "./chatbot.service";

export class ChatbotController {
  static async ask(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const { consultaId, question } = request.body;

      if (!consultaId || typeof consultaId !== "number") {
        return response.status(400).json({ message: "consultaId es requerido y debe ser numérico." });
      }

      if (!question || typeof question !== "string" || !question.trim()) {
        return response.status(400).json({ message: "question es requerida y debe ser un texto no vacío." });
      }

      const result = await ChatbotService.askQuestion(doctorId, {
        consultaId,
        question: question.trim(),
      });

      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
