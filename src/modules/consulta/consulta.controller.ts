import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { ConsultaService } from "./consulta.service";
import { prisma } from "../../configurations/lib/prisma";

const parseFecha = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const fecha = new Date(value);
  if (isNaN(fecha.getTime())) {
    throw new Error(`Fecha inválida: "${value}". Usa formato ISO, ej: 2026-07-01.`);
  }
  return fecha;
};

export class ConsultaController {
  static async consultar(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const { pacienteId, input } = request.body;

      if (!pacienteId || typeof pacienteId !== "number") {
        return response.status(400).json({ message: "pacienteId es requerido y debe ser numérico." });
      }

      if (!input || typeof input !== "string" || !input.trim()) {
        return response.status(400).json({ message: "input es requerido y debe ser un texto no vacío." });
      }

      const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
      if (!paciente) {
        return response.status(404).json({ message: "Paciente no encontrado." });
      }

      const consulta = await ConsultaService.crearConsulta(doctorId, { pacienteId, input: input.trim() });

      return response.status(201).json(consulta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async actualizarConsulta(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID inválido." });
      }

      const { input, output, completed } = request.body;
      if (!input && !output && completed === undefined) {
        return response.status(400).json({ message: "Debe enviar al menos 'input', 'output' o 'completed' para actualizar." });
      }

      const consulta = await ConsultaService.updateConsulta(id, doctorId, { input, output, completed });
      return response.status(200).json(consulta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async obtenerConsulta(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID inválido." });
      }

      const consulta = await ConsultaService.getConsultaById(id);
      return response.status(200).json(consulta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  // RF-19: historial de consultas del médico autenticado, filtrable por paciente y fecha.
  static async obtenerHistorial(request: AuthRequest, response: Response) {
    try {
      const doctorId = request.user?.id;
      if (!doctorId) {
        return response.status(401).json({ message: "No autenticado." });
      }

      const { pacienteId, fechaInicio, fechaFin, page, pageSize } = request.query;

      let pacienteIdNumber: number | undefined;
      if (typeof pacienteId === "string" && pacienteId.trim()) {
        pacienteIdNumber = Number(pacienteId);
        if (isNaN(pacienteIdNumber)) {
          return response.status(400).json({ message: "pacienteId debe ser numérico." });
        }
      }

      let pageNumber = 1;
      if (typeof page === "string" && page.trim()) {
        pageNumber = Number(page);
        if (isNaN(pageNumber) || pageNumber < 1) {
          return response.status(400).json({ message: "page debe ser un número entero positivo." });
        }
      }

      let pageSizeNumber = 10;
      if (typeof pageSize === "string" && pageSize.trim()) {
        pageSizeNumber = Number(pageSize);
        if (isNaN(pageSizeNumber) || pageSizeNumber < 1) {
          return response.status(400).json({ message: "pageSize debe ser un número entero positivo." });
        }
      }

      const fechaInicioDate = parseFecha(fechaInicio);
      const fechaFinDate = parseFecha(fechaFin);

      if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
        return response
          .status(400)
          .json({ message: "fechaInicio no puede ser posterior a fechaFin." });
      }

      const result = await ConsultaService.getHistorialPorDoctor(doctorId, {
        ...(pacienteIdNumber !== undefined ? { pacienteId: pacienteIdNumber } : {}),
        ...(fechaInicioDate !== undefined ? { fechaInicio: fechaInicioDate } : {}),
        ...(fechaFinDate !== undefined ? { fechaFin: fechaFinDate } : {}),
        page: pageNumber,
        pageSize: pageSizeNumber,
      });

      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}