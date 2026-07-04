import { prisma } from "../../configurations/lib/prisma";
import { CreateLaboratorioDto, CreatePacienteDto, UpdatePacienteDto } from "./pacientes.dto";

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
  static async createPaciente(data: CreatePacienteDto, creadoPorId: number) {
    const existe = await prisma.paciente.findUnique({
      where: { documento: data.documento },
    });

    if (existe) {
      throw new Error("Ya existe un paciente registrado con ese número de documento.");
    }

    return await prisma.paciente.create({
      data: {
        nombre: data.nombre,
        edad: data.edad,
        sexo: data.sexo,
        documento: data.documento,
        creadoPorId,
      },
      include: doctorInclude,
    });
  }

  static async listPacientes(search?: string) {
    return await prisma.paciente.findMany({
      ...(search
        ? {
            where: {
              OR: [
                { nombre: { contains: search, mode: "insensitive" } },
                { documento: { contains: search, mode: "insensitive" } },
              ],
            },
          }
        : {}),
      include: doctorInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getPacienteById(id: number) {
    const paciente = await prisma.paciente.findUnique({
      where: { id },
      include: doctorInclude,
    });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    return paciente;
  }

  static async updatePaciente(id: number, data: UpdatePacienteDto) {
    const paciente = await prisma.paciente.findUnique({ where: { id } });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    return await prisma.paciente.update({
      where: { id },
      data,
      include: doctorInclude,
    });
  }

  static async deletePaciente(id: number) {
    const paciente = await prisma.paciente.findUnique({ where: { id } });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    await prisma.paciente.delete({ where: { id } });
    return { message: "Paciente eliminado correctamente." };
  }

  static async addLaboratorio(pacienteId: number, data: CreateLaboratorioDto) {
    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    return await prisma.laboratorio.create({
      data: {
        pacienteId,
        descripcion: data.descripcion,
        resultado: data.resultado,
      },
    });
  }

  static async getExpedienteCompleto(pacienteId: number) {
    const paciente = await prisma.paciente.findUnique({
      where: { id: pacienteId },
      include: {
        ...doctorInclude,
        laboratorios: { orderBy: { fecha: "desc" } },
        consultas: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!paciente) {
      throw new Error("Paciente no encontrado.");
    }

    return paciente;
  }
}
