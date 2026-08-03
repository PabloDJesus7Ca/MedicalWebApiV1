import { z } from "zod";

export const modelNames = ["gemini-3-flash-preview", "gemini-2.5-pro", "gemini-2.5-flash"] as const;

export const UpdateConfigSchema = z.object({
  modelName: z.enum(modelNames, {
    message: "Modelo no válido. Opciones permitidas: gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash"
  }).optional(),
  maxTokens: z.number().int().positive().max(8192, { message: "El máximo de tokens para Gemini es 8192" }).optional(),
  temperatura: z.number().min(0).max(2.0, { message: "La temperatura en Gemini va de 0.0 a 2.0" }).optional(),
  systemPrompt: z.string().trim().min(10).optional(),
});
export type UpdateConfigDto = z.infer<typeof UpdateConfigSchema>;

export const CreatePromptVersionSchema = z.object({
  version: z.string({ message: "La versión es requerida" }).trim().min(1),
  contenido: z.string({ message: "El contenido es requerido" }).trim().min(10),
  activo: z.boolean().optional(),
});
export type CreatePromptVersionDto = z.infer<typeof CreatePromptVersionSchema>;

export const UpdatePromptVersionSchema = z.object({
  version: z.string().trim().min(1).optional(),
  contenido: z.string().trim().min(10).optional(),
  activo: z.boolean().optional(),
});
export type UpdatePromptVersionDto = z.infer<typeof UpdatePromptVersionSchema>;
