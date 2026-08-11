import { GoogleGenAI } from "@google/genai";
import { configSystem } from "@/config/system.config";
import { prisma } from "@/config/lib/prisma";
import { System } from "@shared/type/prompt-config.type";

export const ai = new GoogleGenAI({ apiKey: configSystem.NAMEAPYKEY });
export type { GenerateContentConfig } from "@google/genai";
export { Type } from "@google/genai";

export async function getActiveAiConfig() {
  const config = await prisma.config.findFirst();
  return {
    modelName: config?.modelName ?? "gemini-3.5-flash",
    temperatura: config?.temperatura ?? 0.1,
    maxTokens: config?.maxTokens ?? 4000,
    systemPrompt: config?.systemPrompt ?? System,
    presencePenalty: 0.0,
    frequencyPenalty: 0.0,
  };
}

export function formatAiError(error: unknown): string {
  if (error instanceof Error) {
    const rawMsg = error.message;

    try {
      if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
        const parsed = JSON.parse(rawMsg);
        if (
          parsed?.error?.code === 503 ||
          parsed?.error?.status === "UNAVAILABLE" ||
          parsed?.error?.message?.includes("high demand")
        ) {
          return "El servicio de Inteligencia Artificial está experimentando una alta demanda en este momento. Por favor, intente nuevamente en unos minutos.";
        }
        if (
          parsed?.error?.code === 429 ||
          parsed?.error?.status === "RESOURCE_EXHAUSTED" ||
          parsed?.error?.message?.includes("quota")
        ) {
          return "Se ha superado el límite de consultas de Inteligencia Artificial. Por favor, espere un momento antes de intentar de nuevo.";
        }
        if (parsed?.error?.message) {
          return "El servicio de Inteligencia Artificial no pudo procesar la solicitud en este momento. Intente más tarde.";
        }
      }
    } catch {
    }

    const lower = rawMsg.toLowerCase();
    if (
      lower.includes("503") ||
      lower.includes("high demand") ||
      lower.includes("unavailable") ||
      lower.includes("overloaded")
    ) {
      return "El servicio de Inteligencia Artificial está experimentando una alta demanda en este momento. Por favor, intente nuevamente en unos minutos.";
    }
    if (
      lower.includes("429") ||
      lower.includes("resource_exhausted") ||
      lower.includes("quota") ||
      lower.includes("rate limit")
    ) {
      return "Se ha superado el límite de consultas de Inteligencia Artificial. Por favor, espere un momento.";
    }
    if (lower.includes("api_key") || lower.includes("api key") || lower.includes("invalid_argument")) {
      return "Error de configuración en el servicio de Inteligencia Artificial. Contacte al administrador.";
    }

    return rawMsg;
  }

  return "Ocurrió un error inesperado al procesar la solicitud con Inteligencia Artificial.";
}
