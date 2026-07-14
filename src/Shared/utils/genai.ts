import { GoogleGenAI } from "@google/genai";
import { apiKeys } from "../../configurations/configs";

export const ai = new GoogleGenAI({ apiKey: apiKeys.NAMEAPYKEY });
export type { GenerateContentConfig } from "@google/genai";
