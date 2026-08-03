import { Rol } from "@generated/prisma";
import * as z from "zod";

export const CreateUsuarioAdminDto = z.object({
  nombre: z
    .string({ error: "Nombre es un campo requerido y debe ser texto" })
    .trim()
    .max(20, "El maximo de caracteres permitidos son 20 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras"),
  email: z.string({ error: "El email es requerido y debe ser texto" }).email("El email debe ser un campo valido").trim(),
  password: z
    .string({ error: "Password es un campo requerido y debe ser texto" })
    .min(10, "El minimo de caracteres permitido son 10 caracteres")
    .max(30, "El valor maximo de caracteres permitido son 30 caracteres")
    .trim(),
  rol: z.nativeEnum(Rol, { error: "El rol seleccionado debe ser un rol valido" }),
});

export type CreateUserAllowedForAdmin = z.infer<typeof CreateUsuarioAdminDto>;

export const UpdateUsuarioAdminSchema = z.object({
  nombre: z
    .string({ error: "El nombre debe ser texto" })
    .trim()
    .max(30, "El maximo de caracteres permitidos son 30 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras")
    .optional(),
  email: z.string({ error: "El email debe ser texto" }).email("El email debe ser un campo valido").trim().optional(),
  rol: z.nativeEnum(Rol, { error: "El rol seleccionado debe ser un rol valido" }).optional(),
  activo: z.boolean({ error: "Debe ser verdadero o falso" }).optional(),
});

export type UpdateUsuarioAdminDto = z.infer<typeof UpdateUsuarioAdminSchema>;
