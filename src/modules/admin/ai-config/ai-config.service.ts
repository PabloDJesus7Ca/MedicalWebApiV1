import { Prisma } from "@generated/prisma/index.js";
import { prisma } from "@/config/lib/prisma";
import {
  CreatePromptVersionDto,
  UpdateConfigDto,
  UpdatePromptVersionDto,
} from "./ai-config.dto";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

export class IaConfigService {
  static async listModels(): Promise<string[]> {
    return [
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest",
    ];
  }

  static async getConfig() {
    let config = await prisma.config.findFirst();
    if (!config) {
      config = await prisma.config.create({
        data: {
          modelName: "gemini-3.5-flash",
          maxTokens: 4000,
          temperatura: 0.1,
          systemPrompt:
            "Eres un asistente médico inteligente que analiza datos clínicos y proporciona diagnósticos estructurados en JSON.",
        },
      });
    }
    return config;
  }

  static async updateConfig(
    adminUser: { id: number; nombre?: string },
    dto: UpdateConfigDto
  ) {
    let config = await prisma.config.findFirst();
    if (!config) {
      config = await prisma.config.create({
        data: {
          modelName: dto.modelName ?? "gemini-3.5-flash",
          maxTokens: dto.maxTokens ?? 4000,
          temperatura: dto.temperatura ?? 0.1,
          systemPrompt: dto.systemPrompt ?? "Asistente médico IA",
        },
      });
    } else {
      config = await prisma.config.update({
        where: { id: config.id },
        data: {
          ...(dto.modelName !== undefined ? { modelName: dto.modelName } : {}),
          ...(dto.maxTokens !== undefined ? { maxTokens: dto.maxTokens } : {}),
          ...(dto.temperatura !== undefined ? { temperatura: dto.temperatura } : {}),
          ...(dto.systemPrompt !== undefined ? { systemPrompt: dto.systemPrompt } : {}),
        },
      });
    }

    await logAudit(
      adminUser.id,
      "UPDATE",
      "Config",
      config.id,
      `Admin ${adminUser.nombre || adminUser.id} actualizó la configuración global de IA (${config.modelName})`
    );

    logger.info(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "UPDATE_AI_CONFIG",
        modelo: config.modelName,
      },
      `El Administrador ${adminUser.nombre || adminUser.id} actualizó la configuración de la IA.`
    );

    return config;
  }

  static async listPromptVersions() {
    return await prisma.promptVersion.findMany({
      orderBy: { creadoEn: "desc" },
    });
  }

  static async createPromptVersion(
    adminUser: { id: number; nombre?: string },
    dto: CreatePromptVersionDto
  ) {
    const pv = await prisma.promptVersion.create({ data: dto as Prisma.PromptVersionCreateInput });
    await logAudit(
      adminUser.id,
      "CREATE",
      "PromptVersion",
      pv.id,
      `Admin ${adminUser.nombre || adminUser.id} creó la versión de prompt: ${dto.version}`
    );
    logger.info(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "CREATE_PROMPT_VERSION",
        prompt_id: pv.id,
      },
      `El Administrador ${adminUser.nombre || adminUser.id} creó una nueva versión de Prompt.`
    );
    return pv;
  }

  static async updatePromptVersion(
    id: number,
    adminUser: { id: number; nombre?: string },
    dto: UpdatePromptVersionDto
  ) {
    const existing = await prisma.promptVersion.findUnique({ where: { id } });
    if (!existing) throw new Error("La versión de prompt especificada no fue encontrada.");

    const updated = await prisma.promptVersion.update({
      where: { id },
      data: dto as Prisma.PromptVersionUpdateInput,
    });
    const cambios = Object.entries(dto)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    await logAudit(
      adminUser.id,
      "UPDATE",
      "PromptVersion",
      id,
      `Admin ${adminUser.nombre || adminUser.id} actualizó la PromptVersion #${id}: ${cambios}`
    );
    logger.warn(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "UPDATE_PROMPT_VERSION",
        prompt_id: id,
      },
      `El Administrador ${adminUser.nombre || adminUser.id} actualizó una versión de Prompt.`
    );
    return updated;
  }

  static async activatePromptVersion(id: number, adminUser: { id: number; nombre?: string }) {
    const existing = await prisma.promptVersion.findUnique({ where: { id } });
    if (!existing) throw new Error("La versión de prompt especificada no fue encontrada.");

    await prisma.promptVersion.updateMany({
      where: { activo: true },
      data: { activo: false },
    });
    const activated = await prisma.promptVersion.update({
      where: { id },
      data: { activo: true },
    });
    await logAudit(
      adminUser.id,
      "UPDATE",
      "PromptVersion",
      id,
      `Admin ${adminUser.nombre || adminUser.id} activó la PromptVersion #${id}`
    );
    logger.warn(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "ACTIVATE_PROMPT_VERSION",
        prompt_id: id,
      },
      `El Administrador ${adminUser.nombre || adminUser.id} ACTIVÓ una nueva versión de Prompt en producción.`
    );
    return activated;
  }
}
