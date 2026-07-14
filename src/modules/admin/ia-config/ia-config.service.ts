import { ai } from "../../../Shared/utils/genai";
import { prisma } from "../../../configurations/lib/prisma";
import { UpdateConfigDto, CreatePromptVersionDto, UpdatePromptVersionDto } from "./ia-config.dto";
import { logAudit } from "../../../Shared/utils/audit.helper";

export class IaConfigService {
  static async listModels(): Promise<string[]> {
    const pager = await ai.models.list();
    const models: string[] = [];
    for await (const model of pager) {
      if (model.name) models.push(model.name.replace(/^models\//, ''));
    }
    return models;
  }

  static async getConfig() {
    let config = await prisma.config.findFirst();
    if (!config) {
      config = await prisma.config.create({ data: { id: 1, systemPrompt: "" } });
    }
    return config;
  }

  static async updateConfig(adminUserId: number, dto: UpdateConfigDto) {
    const config = await this.getConfig();
    const updated = await prisma.config.update({
      where: { id: config.id },
      data: {
        ...(dto.modelName !== undefined ? { modelName: dto.modelName } : {}),
        ...(dto.maxTokens !== undefined ? { maxTokens: dto.maxTokens } : {}),
        ...(dto.temperatura !== undefined ? { temperatura: dto.temperatura } : {}),
        ...(dto.systemPrompt !== undefined ? { systemPrompt: dto.systemPrompt } : {}),
      },
    });
    const cambios = Object.entries(dto).map(([k, v]) => `${k}:${v}`).join(', ');
    await logAudit(adminUserId, 'UPDATE', 'Config', config.id, `Configuración IA actualizada: ${cambios}`);
    return updated;
  }

  static async listPromptVersions() {
    return await prisma.promptVersion.findMany({ orderBy: { creadoEn: "desc" } });
  }

  static async createPromptVersion(adminUserId: number, dto: CreatePromptVersionDto) {
    const pv = await prisma.promptVersion.create({ data: dto });
    await logAudit(adminUserId, 'CREATE', 'PromptVersion', pv.id, `Versión ${dto.version} creada`);
    return pv;
  }

  static async updatePromptVersion(id: number, adminUserId: number, dto: UpdatePromptVersionDto) {
    const existing = await prisma.promptVersion.findUnique({ where: { id } });
    if (!existing) throw new Error("PromptVersion no encontrada.");

    const updated = await prisma.promptVersion.update({ where: { id }, data: dto });
    const cambios = Object.entries(dto).map(([k, v]) => `${k}:${v}`).join(', ');
    await logAudit(adminUserId, 'UPDATE', 'PromptVersion', id, `PromptVersion #${id} actualizada: ${cambios}`);
    return updated;
  }

  static async activatePromptVersion(id: number, adminUserId: number) {
    const existing = await prisma.promptVersion.findUnique({ where: { id } });
    if (!existing) throw new Error("PromptVersion no encontrada.");

    await prisma.promptVersion.updateMany({
      where: { activo: true },
      data: { activo: false },
    });
    const activated = await prisma.promptVersion.update({
      where: { id },
      data: { activo: true },
    });
    await logAudit(adminUserId, 'UPDATE', 'PromptVersion', id, `PromptVersion #${id} activada`);
    return activated;
  }
}
