import { z } from "zod";

export const CreatePacienteSchema = z.object({
  nombre: z
    .string({ message: "El nombre es requerido" })
    .trim()
    .min(3, "Mínimo 3 caracteres soportados")
    .max(30, "Maximo 30 caracteres soportados"),
  edad: z
    .number({ message: "La edad es requerida" })
    .int("Debe ser entero")
    .positive("Debe ser positiva")
    .max(100, "La edad máxima es 100 años"),
  sexo: z
    .string({ message: "El sexo es requerido" })
    .trim()
    .toUpperCase()
    .regex(/^(M|F)$/, "Debe ser 'M' o 'F'"),
  documento: z
    .string({ message: "El documento es requerido" })
    .length(11, "La cédula debe tener exactamente 11 caracteres")
    .regex(/^[0-9]+$/, "La cédula solo debe contener números"),
});

export const CreateLaboratorioSchema = z.object({
  descripcion: z
    .string({ message: "La descripción es requerida" })
    .trim()
    .min(3, "Minimo 3 caracteres")
    .max(300, "Maximo 300 caracteres soportados"),
  resultado: z.string({ message: "El resultado es requerido" }).min(1, "El resultado no puede estar vacío"),
});

export type CreateLaboratorioDto = z.infer<typeof CreateLaboratorioSchema>;

export type CreatePacienteDto = z.infer<typeof CreatePacienteSchema>;
export const UpdatePacienteSchema = CreatePacienteSchema.partial();

export type UpdatePacienteDto = z.infer<typeof UpdatePacienteSchema>;
