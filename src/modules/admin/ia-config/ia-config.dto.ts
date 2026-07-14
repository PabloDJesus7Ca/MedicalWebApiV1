export interface UpdateConfigDto {
  modelName?: string;
  maxTokens?: number;
  temperatura?: number;
  systemPrompt?: string;
}

export interface CreatePromptVersionDto {
  version: string;
  contenido: string;
  activo?: boolean;
}

export interface UpdatePromptVersionDto {
  version?: string;
  contenido?: string;
  activo?: boolean;
}
