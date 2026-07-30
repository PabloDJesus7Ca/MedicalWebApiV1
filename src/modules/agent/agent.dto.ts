import { z } from "zod";

export const ChatAgentSchema = z.object({
  pregunta: z.any().refine((val) => val !== undefined && val !== null && val !== "", {
    message: "La pregunta es requerida y no puede estar vacía",
  }),
});

export type ChatAgentDto = z.infer<typeof ChatAgentSchema>;
