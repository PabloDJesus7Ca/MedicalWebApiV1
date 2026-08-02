import { z } from "zod";

export const AskQuestionSchema = z.object({
  consultaId: z.number({ message: "El ID de la consulta es requerido" }).int().positive(),
  question: z
    .string({ message: "La pregunta es requerida" })
    .trim()
    .min(5, "La pregunta debe tener al menos 5 caracteres"),
});

export type AskQuestionDto = z.infer<typeof AskQuestionSchema>;
