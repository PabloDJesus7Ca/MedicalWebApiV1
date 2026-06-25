import { Request, Response } from "express";
import { formatPrompt } from "../Shared/utils/formatPrompt";
import main from "../Agent/model.ai.responses";

export class UserControllerAi {
  static async Chat(request: Request, response: Response) {
    const { pregunta } = request.body;

    let promptInput = "";
    if (typeof pregunta === "string") {
      promptInput = pregunta;
    } else if (pregunta && typeof pregunta === "object") {
      const maybeSug = (pregunta as any).SugestAiAnswerDignostic;
      if (typeof maybeSug === "string") {
        promptInput = maybeSug;
      } else {
        const maybeText = (pregunta as any).text ?? (pregunta as any).message;
        if (typeof maybeText === "string") promptInput = maybeText;
      }
    }
    if (!promptInput || !promptInput.toString().trim()) {
      return response.status(400).json({ ProcessError: "Missing pregunta text" });
    }

    try {
      const prompt = formatPrompt(promptInput);
      const consulta = await main(prompt);
      const cleanedResponse = formatPrompt(consulta ?? "");

      return response.status(200).json(cleanedResponse);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ ProcessError: error.message });
      }
      return response.status(500).json({ ProcessError: "Unknown error" });
    }
  }
}
