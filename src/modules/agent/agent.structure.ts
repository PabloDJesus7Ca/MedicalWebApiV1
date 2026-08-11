import { ai, getActiveAiConfig } from "@shared/utils/ai.helper";
import dotenv from "dotenv";

dotenv.config();

export default async function main(asking: string) {
  const { modelName, temperatura, maxTokens, systemPrompt, presencePenalty, frequencyPenalty } =
    await getActiveAiConfig();

  const response = await ai.models.generateContent({
    model: modelName,
    contents: asking,
    config: {
      systemInstruction: systemPrompt,
      temperature: temperatura,
      maxOutputTokens: maxTokens,
      presencePenalty,
      frequencyPenalty,
    },
  });
  return response.text;
}
