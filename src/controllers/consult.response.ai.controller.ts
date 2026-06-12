import { Request, Response } from "express";
import main from "../Agent/model.ai.responses";

export class UserControllerAi {
  static async Chat(request: Request, response: Response) {
    const { pregunta } = request.body;
    try {
      const consulta = await main(pregunta);
      response.status(200).json({ SugestAiAnswerDignostic: consulta });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ ProcessError: error.message });
      }
    }
    return pregunta;
  }
}
