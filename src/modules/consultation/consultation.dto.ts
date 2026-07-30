import { z } from "zod";

export const HistorialFiltersSchema = z.object({
  pacienteId: z.coerce.number().int().positive().optional(),
  fechaInicio: z.coerce.date().optional(),
  fechaFin: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  all: z.coerce.boolean().default(false),
});

export type HistorialFiltersDto = z.infer<typeof HistorialFiltersSchema>;

export const CreateConsultaSchema = z.object({
  pacienteId: z.number({ message: "El ID del paciente es requerido" }).int().positive(),
  input: z
    .string({ message: "Los síntomas son requeridos" })
    .trim()
    .min(10, "Por favor, sea más descriptivo con los síntomas"),
});

export type CreateConsultaDto = z.infer<typeof CreateConsultaSchema>;

export const UpdateConsultaSchema = z.object({
  input: z.string().trim().min(10).optional(),
  output: z.string().trim().min(10).optional(),
  completed: z.iso.datetime().optional(),
});

export type UpdateConsultaDto = z.infer<typeof UpdateConsultaSchema>;
