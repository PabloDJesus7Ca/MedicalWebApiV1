import { ai } from "../Shared/utils/genai";
import { System } from "../configurations/constant.js";
import dotenv from "dotenv";
dotenv.config();

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
