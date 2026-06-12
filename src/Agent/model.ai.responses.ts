import { GoogleGenAI } from "@google/genai";
import { apiKeys } from "../configurations/configs";
import { System } from "../configurations/constant.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: apiKeys.NAMEAPYKEY });

export default async function main(asking: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${asking}`,
    config: {
      systemInstruction: `${System}`,
      temperature: 0.1,
      maxOutputTokens: 4000,
    },
  });
  return response.text;
}
