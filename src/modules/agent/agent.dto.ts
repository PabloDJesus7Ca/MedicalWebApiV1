import { z } from "zod";

export const ChatAgentSchema = z.object({
  pregunta: z.preprocess((val: any) => {
    if (typeof val === "string") return val;
    if (val && typeof val === "object") {
      return val.SugestAiAnswerDignostic || val.text || val.message || "";
    }
    return "";
  }, z.string().trim().min(1, "El campo de pregunta es requerido y no puede estar vacío.")),
});

export type ChatAgentDto = z.infer<typeof ChatAgentSchema>;
