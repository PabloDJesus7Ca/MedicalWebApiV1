import { Rol } from "@generated/prisma";
import * as z from "zod";

export const CreateUsuarioAdminDto = z.object({
  nombre: z
    .string({ error: "Nombre es un campo requerido" })
    .trim()
    .max(20, { error: "EL maximo de caracteres permitidos son 30 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { error: "Solo se permiten letras" }),
  email: z.email({ pattern: z.regexes.email, error: "El email debe ser un campo valido" }).trim(),
  password: z
    .string({ error: "Password es un campo requerido" })
    .min(10, { error: "El minimo de caracteres permitido son 10 caracteres" })
    .max(30, { error: "El valor maximo de caracteres permitido son 30 caracteres" })
    .trim(),
  rol: z.enum(Rol, { error: "El rol seleccionado debe ser un rol valido" }),
});

export type CreateUserAllowedForAdmin = z.infer<typeof CreateUsuarioAdminDto>;

export const UpdateUsuarioAdminSchema = z.object({
  nombre: z
    .string()
    .trim()
    .max(30, { message: "EL maximo de caracteres permitidos son 30 caracteres" })
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, { message: "Solo se permiten letras" })
    .optional(),
  email: z.email({ message: "El email debe ser un campo valido" }).trim().optional(),
  rol: z.enum(Rol, { message: "El rol seleccionado debe ser un rol valido" }).optional(),
  activo: z.boolean().optional(),
});

export type UpdateUsuarioAdminDto = z.infer<typeof UpdateUsuarioAdminSchema>;
