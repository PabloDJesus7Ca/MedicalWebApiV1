import { z } from "zod";

export const CheckTypeLoginSchema = z.object({
  email: z.string({ error: "El email es requerido y debe ser texto" })
    .email("El email debe ser un campo valido")
    .trim()
    .min(1, "El email no puede estar vacio"),
  password: z
    .string({ error: "La contraseña es requerida y debe ser texto" })
    .trim()
    .min(10, "La contraseña debe tener al menos 10 caracteres"),
});

export type CheckTypeLoginDto = z.infer<typeof CheckTypeLoginSchema>;

export interface LoginResponseDto {
  token: string;
  id: number;
}
