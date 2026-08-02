import { logger } from "@modules/observability/logger";
import { Response } from "express";
import { AuthRequest } from "@shared/middleware/auth.middleware";
import { PacientesService } from "./patient.service";

export class PacientesController {
  static async create(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user) {
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      }
      const paciente = await PacientesService.createPaciente(request.body, user);
      return response.status(201).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al registrar al paciente." });
    }
  }

  static async list(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const search =
        typeof request.query["search"] === "string" ? request.query["search"] : undefined;
      const pacientes = await PacientesService.listPacientes(user, search);
      return response.status(200).json({ pacientes });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error({ error: error.message, stack: error.stack }, "Error fatal capturado en controlador");
        return response.status(500).json({ message: "Error interno del servidor. Por favor, contacta al administrador." });
      }
      return response.status(500).json({ message: "Error interno al listar los pacientes." });
    }
  }

  static async getById(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const id = Number(request.params["id"]);
      const paciente = await PacientesService.getPacienteById(id, user);
      return response.status(200).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al obtener el paciente." });
    }
  }

  static async update(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });

      const paciente = await PacientesService.updatePaciente(id, request.body, user);
      return response.status(200).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al actualizar al paciente." });
    }
  }

  static async delete(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const result = await PacientesService.deletePaciente(id, user);
      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error interno al eliminar al paciente." });
    }
  }

  static async addLaboratorio(request: AuthRequest, response: Response) {
    try {
      const pacienteId = Number(request.params["id"]);
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const { descripcion, resultado } = request.body;

      const laboratorio = await PacientesService.addLaboratorio(
        pacienteId,
        { descripcion, resultado },
        user
      );
      return response.status(201).json({ laboratorio });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno al agregar el resultado de laboratorio." });
    }
  }

  static async getExpediente(request: AuthRequest, response: Response) {
    try {
      const user = request.user;
      if (!user)
        return response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      const pacienteId = Number(request.params["id"]);
      const expediente = await PacientesService.getExpedienteCompleto(pacienteId, user);
      return response.status(200).json({ expediente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno al obtener el expediente médico del paciente." });
    }
  }
}
