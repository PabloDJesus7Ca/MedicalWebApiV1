import { Response } from "express";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { ChatbotService } from "./chatbot.service";
import { AskQuestionSchema } from "./chatbot.dto";
import { ZodError } from "zod";

export class ChatbotController {
  static async ask(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }

      const { consultaId, question } = AskQuestionSchema.parse(request.body);

      const result = await ChatbotService.askQuestion(doctorId, {
        consultaId,
        question,
      });

      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return response.status(400).json({ message: "Datos inválidos", errors: error.issues.map(issue => issue.message) });
      }
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno al procesar la pregunta del chatbot." });
    }
  }
}
