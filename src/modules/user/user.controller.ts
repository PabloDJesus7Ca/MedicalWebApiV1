import { Response } from "express";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { AdminUsuariosService } from "./user.service";

export class AdminUsuarioController {
  static async crearUsuario(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const usuario = await AdminUsuariosService.crearUsuario(request.body, adminUser);

      return response.status(201).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al crear el usuario." });
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
      return response.status(500).json({ message: "Error interno al listar los usuariosDelte." });
    }
  }

  static async obtenerUsuarioPorId(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response
          .status(400)
          .json({ message: "El ID de usuario proporcionado es inválido." });
      }
      const usuario = await AdminUsuariosService.obtenerUsuarioPorId(id);
      return response.status(200).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al obtener el usuario." });
    }
  }

  static async actualizarUsuario(request: AuthRequest, response: Response) {
    try {
      const adminUser = request.user;
      if (!adminUser)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response
          .status(400)
          .json({ message: "El ID de usuario proporcionado es inválido." });
      }
      const usuario = await AdminUsuariosService.actualizarUsuario(id, request.body, adminUser);
      return response.status(200).json({ usuario });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al actualizar el usuario." });
    }
  }
}
