import { z } from "zod";

export const CheckTypeLoginSchema = z.object({
  email: z
    .email({ error: "El email debe ser un campo vaildo" })
    .trim()
    .min(1, { message: "El email no puede estar vacio" }),
  password: z
    .string({ message: "La contraseña es requerida" })
    .trim()
    .min(10, "La contraseña debe tener al menos 10 caracteres"),
});

export type CheckTypeLoginDto = z.infer<typeof CheckTypeLoginSchema>;

export interface LoginResponseDto {
  token: string;
  id: number;
}
