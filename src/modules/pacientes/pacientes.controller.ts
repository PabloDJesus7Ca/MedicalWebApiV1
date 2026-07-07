import { Response } from "express";
import { AuthRequest } from "../../Shared/middlewares/auth.middleware";
import { PacientesService } from "./pacientes.service";

export class PacientesController {
  static async create(request: AuthRequest, response: Response) {
    try {
      const creadoPorId = request.user?.id;
      if (!creadoPorId) {
        return response.status(401).json({ message: "No autenticado." });
      }
      const paciente = await PacientesService.createPaciente(request.body, creadoPorId);
      return response.status(201).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async list(request: AuthRequest, response: Response) {
    try {
      const search =
        typeof request.query["search"] === "string" ? request.query["search"] : undefined;
      const pacientes = await PacientesService.listPacientes(search);
      return response.status(200).json({ pacientes });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(500).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async getById(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      const paciente = await PacientesService.getPacienteById(id);
      return response.status(200).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async update(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      const userId = request.user?.id;
      if (!userId) {
        return response.status(401).json({ message: "No autenticado." });
      }
      const paciente = await PacientesService.updatePaciente(id, request.body, userId);
      return response.status(200).json({ paciente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async delete(request: AuthRequest, response: Response) {
    try {
      const id = Number(request.params["id"]);
      const result = await PacientesService.deletePaciente(id);
      return response.status(200).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async addLaboratorio(request: AuthRequest, response: Response) {
    try {
      const pacienteId = Number(request.params["id"]);
      const { descripcion, resultado } = request.body;

      if (!descripcion || typeof descripcion !== "string") {
        return response.status(400).json({ message: "El campo 'descripcion' es requerido." });
      }

      if (!resultado || typeof resultado !== "string") {
        return response.status(400).json({ message: "El campo 'resultado' es requerido." });
      }

      const laboratorio = await PacientesService.addLaboratorio(pacienteId, { descripcion, resultado });
      return response.status(201).json({ laboratorio });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }

  static async getExpediente(request: AuthRequest, response: Response) {
    try {
      const pacienteId = Number(request.params["id"]);
      const expediente = await PacientesService.getExpedienteCompleto(pacienteId);
      return response.status(200).json({ expediente });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
