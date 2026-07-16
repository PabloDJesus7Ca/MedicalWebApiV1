import { Response } from "express";
import { AuthRequest } from "../../../Shared/middlewares/auth.middleware";
import { IaConfigService } from "./ia-config.service";

export class IaConfigController {
  static async listModels(_request: AuthRequest, response: Response) {
    try {
      const models = await IaConfigService.listModels();
      return response.status(200).json({ models });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(500).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async getConfig(_request: AuthRequest, response: Response) {
    try {
      const config = await IaConfigService.getConfig();
      return response.status(200).json({ config });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(500).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async updateConfig(request: AuthRequest, response: Response) {
    try {
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });

      const config = await IaConfigService.updateConfig(adminUserId, request.body);
      return response.status(200).json({ config });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(400).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async listPromptVersions(_request: AuthRequest, response: Response) {
    try {
      const versions = await IaConfigService.listPromptVersions();
      return response.status(200).json({ versions });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(500).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async createPromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });

      const { version, contenido } = request.body;
      if (!version || typeof version !== "string") {
        return response.status(400).json({ message: "version es requerida." });
      }
      if (!contenido || typeof contenido !== "string") {
        return response.status(400).json({ message: "contenido es requerido." });
      }

      const pv = await IaConfigService.createPromptVersion(adminUserId, { version: version.trim(), contenido: contenido.trim(), activo: request.body.activo });
      return response.status(201).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(400).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async updatePromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });

      const id = Number(request.params["id"]);
      if (isNaN(id)) return response.status(400).json({ message: "ID inválido." });

      const pv = await IaConfigService.updatePromptVersion(id, adminUserId, request.body);
      return response.status(200).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(404).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async activatePromptVersion(request: AuthRequest, response: Response) {
    try {
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });

      const id = Number(request.params["id"]);
      if (isNaN(id)) return response.status(400).json({ message: "ID inválido." });

      const pv = await IaConfigService.activatePromptVersion(id, adminUserId);
      return response.status(200).json({ version: pv });
    } catch (error: unknown) {
      if (error instanceof Error) return response.status(404).json({ message: error.message });
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
