import { prisma } from "../../configurations/lib/prisma";
import { HistorialFiltersDto } from "./consulta.dto";

export class ConsultaService {
  // TODO: Lógica para enviar datos a Gemini 2.5 y registrar el resultado de forma inmutable.
  // Nota para quien implemente este método: al crear el registro en `Consulta`,
  // recordar llamar también a `logAudit(doctorId, "CONSULTA_IA", "Consulta", consulta.id, ...)`
  // (ver src/Shared/utils/audit.helper.ts) para mantener la trazabilidad completa.

  /**
   * Retorna el historial de consultas del médico autenticado, con filtros
   * opcionales por paciente y por rango de fechas.
   *
   * Solo se retornan consultas cuyo `doctorId` coincide con el médico autenticado:
   * un médico nunca puede ver el historial de consultas de otro médico.
   */
  static async getHistorialPorDoctor(doctorId: number, filtros: HistorialFiltersDto) {
    return await prisma.consulta.findMany({
      where: {
        doctorId,
        ...(filtros.pacienteId ? { pacienteId: filtros.pacienteId } : {}),
        ...(filtros.fechaInicio || filtros.fechaFin
          ? {
              createdAt: {
                ...(filtros.fechaInicio ? { gte: filtros.fechaInicio } : {}),
                ...(filtros.fechaFin ? { lte: filtros.fechaFin } : {}),
              },
            }
          : {}),
      },
      include: {
        paciente: {
          select: { id: true, nombre: true, documento: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
