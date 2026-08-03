import { z } from "zod";

export const modelNames = ["gemini-3-flash-preview", "gemini-2.5-pro", "gemini-2.5-flash"] as const;

export const UpdateConfigSchema = z.object({
  modelName: z.enum(modelNames, {
    message: "Modelo no válido. Opciones permitidas: gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash",
    error: "Modelo no válido. Opciones permitidas: gemini-3.6-flash, gemini-3.5-flash, gemini-flash-latest"
  }).optional(),
  maxTokens: z.number({ error: "Los tokens deben ser un número" })
    .int("Los tokens deben ser enteros")
    .positive("Los tokens deben ser mayor a 0")
    .max(8192, { message: "El máximo de tokens para Gemini es 8192" }).optional(),
  temperatura: z.number({ error: "La temperatura debe ser un número" })
    .min(0, "La temperatura mínima es 0.0")
    .max(2.0, { message: "La temperatura en Gemini va de 0.0 a 2.0" }).optional(),
  systemPrompt: z.string({ error: "El prompt debe ser texto" })
    .trim()
    .min(10, "El prompt debe tener al menos 10 caracteres")
    .optional(),
});
export type UpdateConfigDto = z.infer<typeof UpdateConfigSchema>;

export const CreatePromptVersionSchema = z.object({
  version: z.string({ error: "La versión es requerida y debe ser texto" })
    .trim()
    .min(1, "La versión no puede estar vacía"),
  contenido: z.string({ error: "El contenido es requerido y debe ser texto" })
    .trim()
    .min(10, "El contenido debe tener al menos 10 caracteres"),
  activo: z.boolean({ error: "Debe ser verdadero o falso" }).optional(),
});
export type CreatePromptVersionDto = z.infer<typeof CreatePromptVersionSchema>;

export const UpdatePromptVersionSchema = z.object({
  version: z.string({ error: "La versión debe ser texto" })
    .trim()
    .min(1, "La versión no puede estar vacía")
    .optional(),
  contenido: z.string({ error: "El contenido debe ser texto" })
    .trim()
    .min(10, "El contenido debe tener al menos 10 caracteres")
    .optional(),
  activo: z.boolean({ error: "Debe ser verdadero o falso" }).optional(),
});
export type UpdatePromptVersionDto = z.infer<typeof UpdatePromptVersionSchema>;
