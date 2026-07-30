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
    .max(100),
  sexo: z
    .string({ message: "El sexo es requerido" })
    .trim()
    .toUpperCase()
    .regex(/^(M|F)$/, "Debe ser 'M' o 'F'"),
  documento: z
    .string({ message: "El documento es requerido" })
    .trim()
    .max(11, "El numero de cedula permitido oficialmente son 11 caracteres"),
});

export const CreateLaboratorioSchema = z.object({
  descripcion: z
    .string({ message: "La descripción es requerida" })
    .trim()
    .min(3, "Minimo 3 caracteres")
    .max(300, "Maximo 300 caracteres soportados"),
  resultado: z.string({ message: "El resultado es requerido" }).min(1),
});

export type CreateLaboratorioDto = z.infer<typeof CreateLaboratorioSchema>;

export type CreatePacienteDto = z.infer<typeof CreatePacienteSchema>;
export const UpdatePacienteSchema = CreatePacienteSchema.partial();

export type UpdatePacienteDto = z.infer<typeof UpdatePacienteSchema>;
