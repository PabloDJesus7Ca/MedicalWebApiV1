import { z } from "zod";

export const CreatePacienteSchema = z.object({
  nombre: z
    .string({ message: "El nombre es requerido" })
    .trim()
    .min(3, "Debe ser un nombre real ")
    .max(30, "El nombre no puede tener esta longitud"),
  edad: z
    .number({ message: "La edad es requerida" })
    .int("La edad debe ser positiva")
    .positive("La edad debe ser positiva")
    .max(100, "La edad debe ser una edad valida"),
  sexo: z
    .string({ message: "El sexo es requerido" })
    .trim()
    .toUpperCase()
    .regex(/^(M|F)$/, "El sexo debe ser masculino o femenino"),
  documento: z
    .string({ message: "El numero de documento es requerido" })
    .length(11, "La cédula debe ser tener 11 caracteres")
    .regex(/^[0-9]+$/, "La cédula solo debe contener números"),
});

export const CreateLaboratorioSchema = z.object({
  descripcion: z
    .string({ message: "La descripción del laboratorios es requerida" })
    .trim()
    .min(3, "La descripcion debe ser mas larga")
    .max(300, "Maximo 300 caracteres soportados para descripcion"),
  resultado: z
    .string({ message: "El resultado es requerido" })
    .min(1, "El resultado no puede estar vacío"),
});

export type CreateLaboratorioDto = z.infer<typeof CreateLaboratorioSchema>;

export type CreatePacienteDto = z.infer<typeof CreatePacienteSchema>;
export const UpdatePacienteSchema = CreatePacienteSchema.partial();

export type UpdatePacienteDto = z.infer<typeof UpdatePacienteSchema>;
