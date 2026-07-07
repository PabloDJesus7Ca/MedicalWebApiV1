import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { AdminService, LogFilters } from "./admin.service";

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
    }
  }
}
