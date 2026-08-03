import { z } from "zod";

export const HistorialFiltersSchema = z.object({
  pacienteId: z.coerce.number({ error: "ID de paciente inválido" }).int("Debe ser entero").positive("Debe ser positivo").optional(),
  fechaInicio: z.coerce.date({ error: "Fecha de inicio inválida" }).optional(),
  fechaFin: z.coerce.date({ error: "Fecha de fin inválida" }).optional(),
  page: z.coerce.number({ error: "Página inválida" }).int("Debe ser entero").positive("Debe ser positivo").default(1),
  pageSize: z.coerce.number({ error: "Tamaño de página inválido" }).int("Debe ser entero").positive("Debe ser positivo").default(10),
  all: z.coerce.boolean({ error: "Debe ser verdadero o falso" }).default(false),
});

export type HistorialFiltersDto = z.infer<typeof HistorialFiltersSchema>;

export const CreateConsultaSchema = z.object({
  pacienteId: z.number({ error: "El ID del paciente es requerido y válido" }).int("Debe ser entero").positive("Debe ser positivo"),
  input: z
    .string({ error: "Los síntomas son requeridos y deben ser texto" })
    .trim()
    .min(10, "Por favor, sea más descriptivo con los síntomas"),
});

export type CreateConsultaDto = z.infer<typeof CreateConsultaSchema>;

export const UpdateConsultaSchema = z.object({
  input: z.string({ error: "Los síntomas deben ser texto" }).trim().min(10, "Por favor, sea más descriptivo con los síntomas").optional(),
  output: z.string({ error: "El output debe ser texto" }).trim().min(10, "El output debe tener al menos 10 caracteres").optional(),
  completed: z.string({ error: "La fecha debe ser texto" }).datetime({ message: "Formato de fecha inválido" }).optional(),
});

export type UpdateConsultaDto = z.infer<typeof UpdateConsultaSchema>;
