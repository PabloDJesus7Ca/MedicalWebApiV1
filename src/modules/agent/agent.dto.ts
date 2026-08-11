import { z } from "zod";

export const ChatAgentSchema = z.object({
  pregunta: z.preprocess(
    (val: unknown) => {
      if (typeof val === "string") return val;
      if (val && typeof val === "object") {
        const obj = val as Record<string, unknown>;
        return (obj.SugestAiAnswerDignostic || obj.text || obj.message || "") as string;
      }
      return "";
    },
    z.string().trim().min(1, "El campo de pregunta es requerido y no puede estar vacío.")
  ),
});

export type ChatAgentDto = z.infer<typeof ChatAgentSchema>;
