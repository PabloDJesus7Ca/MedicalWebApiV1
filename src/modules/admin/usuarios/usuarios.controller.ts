import { Response } from "express";
import { AuthRequest } from "../../../Shared/middlewares/auth.middleware";
import { AdminUsuariosService } from "./usuarios.service";

export class AdminUsuarioController {
  static async crearUsuario(request: AuthRequest, response: Response) {
    try {
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });
      const usuario = await AdminUsuariosService.crearUsuario(request.body, adminUserId);
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
      const usuarios = await AdminUsuariosService.listarUsuarios();
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
      const usuario = await AdminUsuariosService.obtenerUsuarioPorId(id);
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
      const adminUserId = request.user?.id;
      if (!adminUserId) return response.status(401).json({ message: "No autenticado." });
      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID de usuario inválido." });
      }
      const usuario = await AdminUsuariosService.actualizarUsuario(id, request.body, adminUserId);
      return response.status(200).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
