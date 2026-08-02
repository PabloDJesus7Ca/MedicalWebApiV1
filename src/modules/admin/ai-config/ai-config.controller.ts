import { logger } from "@modules/observability/logger";
import { Response } from "express";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { IaConfigService } from "./ai-config.service";

export class IaConfigController {
  static async listModels(_request: AuthRequest, response: Response) {
    try {
      const models = await IaConfigService.listModels();
      return response.status(200).json({ models });
    } catch (error: unknown) {
      if (error instanceof Error) logger.error({ error: error.message, stack: error.stack }, "Error fatal capturado en controlador");
        return response.status(500).json({ message: "Error interno del servidor. Por favor, contacta al administrador." });
      return response.status(500).json({ message: "Error interno al listar los modelos de IA." });
    }
  }

  static async getConfig(_request: AuthRequest, response: Response) {
    try {
      const config = await IaConfigService.getConfig();
      return response.status(200).json({ config });
    } catch (error: unknown) {
      if (error instanceof Error) logger.error({ error: error.message, stack: error.stack }, "Error fatal capturado en controlador");
        return response.status(500).json({ message: "Error interno del servidor. Por favor, contacta al administrador." });
      return response
        .status(500)
        .json({ message: "Error interno al obtener la configuración de IA." });
    }
  }

  static async updateConfig(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const config = await IaConfigService.updateConfig(adminUser, request.body);
      return response.status(200).json({ config });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(400).json({ message: error.message });
      return response
        .status(500)
        .json({ message: "Error interno al actualizar la configuración de IA." });
    }
  }

  static async listPromptVersions(_request: AuthRequest, response: Response) {
    try {
      const versions = await IaConfigService.listPromptVersions();
      return response.status(200).json({ versions });
    } catch (error: unknown) {
      if (error instanceof Error) logger.error({ error: error.message, stack: error.stack }, "Error fatal capturado en controlador");
        return response.status(500).json({ message: "Error interno del servidor. Por favor, contacta al administrador." });
      return response
        .status(500)
        .json({ message: "Error interno al listar las versiones de prompts." });
    }
  }

  static async createPromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const { version, contenido } = request.body;

      const pv = await IaConfigService.createPromptVersion(adminUser, {
        version: version.trim(),
        contenido: contenido.trim(),
        activo: request.body.activo,
      });
      return response.status(201).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(400).json({ message: error.message });
      return response
        .status(500)
        .json({ message: "Error interno al crear la versión del prompt." });
    }
  }

  static async updatePromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const id = Number(request.params["id"]);
      if (isNaN(id))
        return response
          .status(400)
          .json({ message: "El ID de la versión del prompt es inválido." });

      const pv = await IaConfigService.updatePromptVersion(id, adminUser, request.body);
      return response.status(200).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(404).json({ message: error.message });
      return response
        .status(500)
        .json({ message: "Error interno al actualizar la versión del prompt." });
    }
  }

  static async activatePromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const id = Number(request.params["id"]);
      if (isNaN(id))
        return response
          .status(400)
          .json({ message: "El ID de la versión del prompt es inválido." });

      const pv = await IaConfigService.activatePromptVersion(id, adminUser);
      return response.status(200).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(404).json({ message: error.message });
      return response
        .status(500)
        .json({ message: "Error interno al activar la versión del prompt." });
    }
  }
}
