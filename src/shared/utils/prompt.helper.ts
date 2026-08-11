import { logger } from "@modules/observability/logger";

export const utilsFormatPrompt = (inputDiagnostic: string) => {
  try {
    if (!inputDiagnostic) return "";

    const cleaned = inputDiagnostic
      .replace(/\\r\\n|\\n|\\r/g, "\n")
      .replace(/\/n/g, "\n")
      .replace(/\r\n?/g, "\n")
      .replace(/`{3}[\s\S]*?`{3}/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/~~(.*?)~~/gs, "$1")
      .replace(/\*\*(.*?)\*\*/gs, "$1")
      .replace(/__(.*?)__/gs, "$1")
      .replace(/\*(.*?)\*/gs, "$1")
      .replace(/_(.*?)_/gs, "$1")
      .replace(/#+\s*/g, "")
      .replace(/(^|\n)\s*([-*+•]|\d+[.)])\s+/g, "$1")
      .replace(/-{3,}/g, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^[ \t]+|[ \t]+$/gm, "")
      .replace(/[*_`~]/g, "")
      .replace(/^[\s\-\*\+_>]+|[\s\-\*\+_>]+$/gm, "")
      .trim();

    return cleaned;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error({ error: error.message }, "Error formateando prompt clínico");
    }
    return "";
  }
};
