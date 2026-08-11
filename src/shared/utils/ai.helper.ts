import { GoogleGenAI, type GenerateContentConfig, Type } from "@google/genai";
import { configSystem } from "@/config/system.config";
import { prisma } from "@/config/lib/prisma";
import { System } from "@shared/type/prompt-config.type";

export const ai = new GoogleGenAI({ apiKey: configSystem.NAMEAPYKEY });
export type { GenerateContentConfig };
export { Type };

export interface ActiveAiConfig {
  modelName: string;
  temperatura: number;
  maxTokens: number;
  systemPrompt: string;
  presencePenalty: number;
  frequencyPenalty: number;
}

export const AI_ERROR_MESSAGES = {
  HIGH_DEMAND:
    "El servicio de Inteligencia Artificial está experimentando una alta demanda en este momento. Por favor, intente nuevamente en unos minutos.",
  QUOTA_EXCEEDED:
    "Se ha superado el límite de consultas de Inteligencia Artificial. Por favor, espere un momento antes de intentar de nuevo.",
  CONFIG_ERROR:
    "Error de configuración en el servicio de Inteligencia Artificial. Contacte al administrador.",
  GENERIC_UNAVAILABLE:
    "El servicio de Inteligencia Artificial no pudo procesar la solicitud en este momento. Intente más tarde.",
  UNEXPECTED:
    "Ocurrió un error inesperado al procesar la solicitud con Inteligencia Artificial.",
} as const;

export async function getActiveAiConfig(): Promise<ActiveAiConfig> {
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
  if (!(error instanceof Error)) {
    return AI_ERROR_MESSAGES.UNEXPECTED;
  }

  const rawMsg = error.message;

  try {
    if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
      const parsed = JSON.parse(rawMsg);
      const code = parsed?.error?.code;
      const status = parsed?.error?.status;
      const msg = (parsed?.error?.message ?? "").toLowerCase();

      if (code === 503 || status === "UNAVAILABLE" || msg.includes("high demand")) {
        return AI_ERROR_MESSAGES.HIGH_DEMAND;
      }
      if (code === 429 || status === "RESOURCE_EXHAUSTED" || msg.includes("quota")) {
        return AI_ERROR_MESSAGES.QUOTA_EXCEEDED;
      }
      if (parsed?.error?.message) {
        return AI_ERROR_MESSAGES.GENERIC_UNAVAILABLE;
      }
    }
  } catch {
    // Ignore JSON parse errors for non-JSON raw strings
  }

  const lower = rawMsg.toLowerCase();
  if (
    lower.includes("503") ||
    lower.includes("high demand") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded")
  ) {
    return AI_ERROR_MESSAGES.HIGH_DEMAND;
  }
  if (
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("rate limit")
  ) {
    return AI_ERROR_MESSAGES.QUOTA_EXCEEDED;
  }
  if (lower.includes("api_key") || lower.includes("api key") || lower.includes("invalid_argument")) {
    return AI_ERROR_MESSAGES.CONFIG_ERROR;
  }

  return rawMsg;
}
