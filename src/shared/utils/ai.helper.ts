import { GoogleGenAI } from "@google/genai";
import { configSystem } from "@/config/system.config";

export const ai = new GoogleGenAI({ apiKey: configSystem.NAMEAPYKEY });
export type { GenerateContentConfig } from "@google/genai";
