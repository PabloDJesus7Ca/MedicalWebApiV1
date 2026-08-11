import { z } from "zod";

export const AskQuestionSchema = z.object({
  consultaId: z.number({ error: "El ID de la consulta es requerido y debe ser un número" })
    .int("Debe ser entero")
    .positive("Debe ser mayor a 0")
    .max(2147483647, "El ID de la consulta no es válido (demasiado grande)"),
  question: z
    .string({ error: "La pregunta es requerida y debe ser texto" })
    .trim()
    .min(5, "La pregunta debe tener al menos 5 caracteres"),
});

export type AskQuestionDto = z.infer<typeof AskQuestionSchema>;
