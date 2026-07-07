// TODO: Implementar controlador de creación de consulta con Gemini 2.5 y auditoría (RF-13 a RF-18)
import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { ConsultaService } from "./consulta.service";

const parseFecha = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const fecha = new Date(value);
  if (isNaN(fecha.getTime())) {
    throw new Error(`Fecha inválida: "${value}". Usa formato ISO, ej: 2026-07-01.`);
  }
  return fecha;
};

export class ConsultaController {
  // RF-19: historial de consultas del médico autenticado, filtrable por paciente y fecha.
  static async obtenerHistorial(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const { pacienteId, fechaInicio, fechaFin } = request.query;

      let pacienteIdNumber: number | undefined;
      if (typeof pacienteId === "string" && pacienteId.trim()) {
        pacienteIdNumber = Number(pacienteId);
        if (isNaN(pacienteIdNumber)) {
          return response.status(400).json({ message: "pacienteId debe ser numérico." });
        }
      }

      const fechaInicioDate = parseFecha(fechaInicio);
      const fechaFinDate = parseFecha(fechaFin);

      if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
        return response
          .status(400)
          .json({ message: "fechaInicio no puede ser posterior a fechaFin." });
      }

      const historial = await ConsultaService.getHistorialPorDoctor(doctorId, {
        ...(pacienteIdNumber !== undefined ? { pacienteId: pacienteIdNumber } : {}),
        ...(fechaInicioDate !== undefined ? { fechaInicio: fechaInicioDate } : {}),
        ...(fechaFinDate !== undefined ? { fechaFin: fechaFinDate } : {}),
      });

      return response.status(200).json({ historial });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
