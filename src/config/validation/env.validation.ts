import * as z from "zod";
export const envSchema = z.object({
  PORT: z
    .string({ message: "El puerto no puede estar vacio" })
    .trim()
    .min(1, { message: "El puerto no puede estar vacio" })
    .transform((val) => Number(val))
    .pipe(
      z
        .number()
        .int({ message: "El puerto debe ser un número entero" })
        .positive({ message: "El puerto debe ser mayor a 0" })
        .max(65535, { message: "El numero maximo de puertos es de 65535" })
    ),

  DATABASE_URL: z.url().min(1, { message: "La url no puede estar vacia" }).trim(),

  JWT_SECRET: z
    .string({ message: "El secreto JWT es requerido" })
    .trim()
    .min(10, { message: "El secreto debe tener mínimo 10 caracteres" }),

  JWT_EXPIRES_IN: z.string({ message: "La duración del JWT es requerida" }).trim(),

  GEMINI_API_KEY: z
    .string({ message: "La API Key de Gemini es requerida" })
    .trim()
    .startsWith("AIzaSy", { message: "Formato de API Key inválido" })
    .length(39, { message: "La API Key debe tener 39 caracteres" }),

  NODE_ENV: z.enum(["development", "production", "test"], {
    message: "Entorno inválido (debe ser development, production o test)",
  }),
});
