import { Response } from "express";
import { AdminService, LogFilters } from "./admin.service";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";

export class AdminController {
  public static async listLogs(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const usuario = req.query.usuario as string | undefined;
    const fecha = req.query.fecha as string | undefined;
    const tipoAccion = req.query.tipoAccion as string | undefined;

    try {
      const filters: LogFilters = {};
      if (usuario) filters.usuario = usuario;
      if (fecha) filters.fecha = fecha;
      if (tipoAccion) filters.tipoAccion = tipoAccion;
      const result = await AdminService.getLogsPaged(page, pageSize, filters);
      return res.json(result);
    } catch (error) {
      console.error("Error fetching logs:", error);
      return res.status(500).json({ message: "Error fetching logs" });
    }}
// TODO: Implementar controladores de logs de auditoría y métricas (RF-25 a RF-28)
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
