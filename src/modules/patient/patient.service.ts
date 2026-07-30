import { prisma } from "@/config/lib/prisma";
import { CreateLaboratorioDto, CreatePacienteDto, UpdatePacienteDto } from "./patient.dto";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

const doctorInclude = {
  creadoPor: {
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
    },
  },
} as const;

export class PacientesService {
  static async createPaciente(
    data: CreatePacienteDto,
    user: { id: number; rol: string; nombre?: string }
  ) {
    const existe = await prisma.paciente.findUnique({
      where: { documento: data.documento },
    });

    if (existe) {
      throw new Error("Ya existe un paciente registrado con ese número de documento.");
    }

    const paciente = await prisma.paciente.create({
      data: {
        nombre: data.nombre,
        edad: data.edad,
        sexo: data.sexo,
        documento: data.documento,
        creadoPorId: user.id,
      },
      include: doctorInclude,
    });

    await logAudit(
      user.id,
      "CREATE",
      "Paciente",
      paciente.id,
      `Dr(a). ${user.nombre || user.id} registró al paciente ${data.nombre} (${data.documento})`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "CREATE_PACIENTE",
        paciente_id: paciente.id,
      },
      `Dr(a). ${user.nombre || user.id} registró al paciente ${data.nombre}`
    );
    return paciente;
  }

  static async listPacientes(user: { id: number; rol: string; nombre?: string }, search?: string) {
    const baseWhere = user.rol === "ADMIN" ? { activo: true } : { creadoPorId: user.id, activo: true };
    return await prisma.paciente.findMany({
      where: search
        ? {
            ...baseWhere,
            OR: [
              { nombre: { contains: search, mode: "insensitive" } },
              { documento: { contains: search, mode: "insensitive" } },
            ],
          }
        : baseWhere,
      include: doctorInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPacienteById(id: number, user: { id: number; rol: string; nombre?: string }) {
    const where = user.rol === "ADMIN" ? { id, activo: true } : { id, creadoPorId: user.id, activo: true };
    const paciente = await prisma.paciente.findFirst({
      where,
      include: doctorInclude,
    });

    if (!paciente) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    return paciente;
  }

  static async updatePaciente(
    id: number,
    data: UpdatePacienteDto,
    user: { id: number; rol: string; nombre?: string }
  ) {
    const where = user.rol === "ADMIN" ? { id, activo: true } : { id, creadoPorId: user.id, activo: true };
    const paciente = await prisma.paciente.findFirst({ where });

    if (!paciente) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    const updated = await prisma.paciente.update({
      where: { id },
      data: data as any,
      include: doctorInclude,
    });

    await logAudit(
      user.id,
      "UPDATE",
      "Paciente",
      id,
      `Dr(a). ${user.nombre || user.id} actualizó los datos del paciente ${paciente.nombre}`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "UPDATE_PACIENTE",
        paciente_id: id,
      },
      `Dr(a). ${user.nombre || user.id} actualizó al paciente ${paciente.nombre}`
    );

    return updated;
  }

  static async deletePaciente(id: number, user: { id: number; rol: string; nombre?: string }) {
    const where = user.rol === "ADMIN" ? { id, activo: true } : { id, creadoPorId: user.id, activo: true };
    const paciente = await prisma.paciente.findFirst({ where });

    if (!paciente) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    // Soft Delete (Eliminación Lógica)
    await prisma.paciente.update({ where: { id }, data: { activo: false } });

    await logAudit(
      user.id,
      "DELETE",
      "Paciente",
      id,
      `Dr(a). ${user.nombre || user.id} eliminó el registro del paciente ${paciente.nombre}`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "DELETE_PACIENTE",
        paciente_id: id,
      },
      `Dr(a). ${user.nombre || user.id} eliminó al paciente ${paciente.nombre}`
    );
    return { message: "Paciente eliminado correctamente." };
  }

  static async addLaboratorio(
    pacienteId: number,
    data: CreateLaboratorioDto,
    user: { id: number; rol: string; nombre?: string }
  ) {
    const where =
      user.rol === "ADMIN" ? { id: pacienteId, activo: true } : { id: pacienteId, creadoPorId: user.id, activo: true };
    const paciente = await prisma.paciente.findFirst({ where });

    if (!paciente) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    const laboratorio = await prisma.laboratorio.create({
      data: {
        pacienteId,
        descripcion: data.descripcion,
        resultado: data.resultado,
      },
    });

    await logAudit(
      user.id,
      "CREATE",
      "Laboratorio",
      laboratorio.id,
      `Dr(a). ${user.nombre || user.id} agregó un resultado de laboratorio al paciente ${paciente.nombre}`
    );

    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "ADD_LABORATORIO",
        paciente_id: pacienteId,
      },
      `Dr(a). ${user.nombre || user.id} agregó laboratorio al paciente ${paciente.nombre}`
    );

    return laboratorio;
  }

  static async getExpedienteCompleto(
    pacienteId: number,
    user: { id: number; rol: string; nombre?: string }
  ) {
    const where =
      user.rol === "ADMIN" ? { id: pacienteId, activo: true } : { id: pacienteId, creadoPorId: user.id, activo: true };
    const paciente = await prisma.paciente.findFirst({
      where,
      include: {
        ...doctorInclude,
        laboratorios: { orderBy: { fecha: "desc" } },
        consultas: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!paciente) {
      throw new Error("Paciente no encontrado o acceso denegado.");
    }

    const pacienteParsed = {
      ...paciente,
      consultas: paciente.consultas.map((consulta) => {
        let outputParsed = consulta.output;
        if (typeof consulta.output === "string") {
          try {
            outputParsed = JSON.parse(consulta.output);
          } catch (e) {}
        }
        return {
          ...consulta,
          output: outputParsed,
        };
      }),
    };

    await logAudit(
      user.id,
      "READ",
      "Paciente",
      paciente.id,
      `Dr(a). ${user.nombre || user.id} visualizó el expediente clínico completo del paciente ${paciente.nombre}`
    );
    logger.info(
      {
        doctor_id: user.id,
        doctor_nombre: user.nombre,
        accion: "READ_EXPEDIENTE",
        paciente_id: pacienteId,
      },
      `Dr(a). ${user.nombre || user.id} revisó expediente completo de ${paciente.nombre}`
    );
    return pacienteParsed;
  }
}
