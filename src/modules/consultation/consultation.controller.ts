import { logger } from "@modules/observability/logger";
import { Response } from "express";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { ConsultaService } from "./consultation.service";
import { prisma } from "@/config/lib/prisma";
import { HistorialFiltersSchema } from "./consultation.dto";
import { ZodError } from "zod";

export class ConsultaController {
  static async consultar(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }

      const { pacienteId, input } = request.body;

      const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
      if (!paciente) {
        return response.status(404).json({ message: "Paciente no encontrado." });
      }

      const consulta = await ConsultaService.crearConsulta(user, {
        pacienteId,
        input: input.trim(),
      });

      let outputLimpio = consulta.output;
      try {
        outputLimpio = JSON.parse(consulta.output);
      } catch (e) {
        logger.info({ e }, "Error al Parsear Datos En La Consulta");
      }

      return response.status(201).json({
        ...consulta,
        output: outputLimpio,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(
          { error: error.message, stack: error.stack },
          "Error fatal capturado en controlador"
        );
        return response
          .status(500)
          .json({ message: "Error interno del servidor. Por favor, contacta al administrador." });
      }
      return response.status(500).json({ message: "Error interno al crear la consulta médica." });
    }
  }

  static async actualizarConsulta(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }

      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "El ID de la consulta es inválido." });
      }

      const { input, output, completed } = request.body;

      const consulta = await ConsultaService.updateConsulta(id, user, {
        input,
        output,
        completed,
      });
      return response.status(200).json(consulta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno al actualizar la consulta médica." });
    }
  }

  static async obtenerConsulta(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }

      const id = Number(request.params["id"]);
      if (isNaN(id)) {
        return response.status(400).json({ message: "El ID de la consulta es inválido." });
      }

      const consulta = await ConsultaService.getConsultaById(id, user);
      return response.status(200).json(consulta);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al obtener la consulta médica." });
    }
  }

  // RF-19: historial de consultas del médico autenticado, filtrable por paciente y fecha.
  static async obtenerHistorial(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }

      const query = HistorialFiltersSchema.parse(request.query);

      if (query.fechaInicio && query.fechaFin && query.fechaInicio > query.fechaFin) {
        return response.status(400).json({
          message: "La fecha de inicio no puede ser posterior a la fecha de fin.",
        });
      }

      const result = await ConsultaService.getHistorialPorDoctor(user, {
        pacienteId: query.pacienteId,
        fechaInicio: query.fechaInicio,
        fechaFin: query.fechaFin,
        page: query.page,
        pageSize: query.pageSize,
        all: query.all,
      });

      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        return response.status(400).json({
          message: "Filtros inválidos",
          errors: error.issues.map((issue) => issue.message),
        });
      }
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno al obtener el historial de consultas." });
    }
  }
}
