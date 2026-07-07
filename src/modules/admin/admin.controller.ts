// TODO: Implementar controladores de logs de auditoría y métricas (RF-25 a RF-28)
import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { AdminService } from "./admin.service";

export class AdminController {
  static async crearUsuario(request: AuthRequest, response: Response) {
    try {
      const usuario = await AdminService.crearUsuario(request.body);
      return response.status(201).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async listarUsuarios(_request: AuthRequest, response: Response) {
    try {
      const usuarios = await AdminService.listarUsuarios();
      return response.status(200).json({ usuarios });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async obtenerUsuarioPorId(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID de usuario inválido." });
      }
      const usuario = await AdminService.obtenerUsuarioPorId(id);
      return response.status(200).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async actualizarUsuario(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID de usuario inválido." });
      }
      const usuario = await AdminService.actualizarUsuario(id, request.body);
      return response.status(200).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
