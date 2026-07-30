import { ai } from "@shared/utils/ai.helper";
import { System } from "@shared/type/prompt-config.type";
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
      presencePenalty: 0.0,
      frequencyPenalty: 0.0,
    },
  });
  return response.text;
}
