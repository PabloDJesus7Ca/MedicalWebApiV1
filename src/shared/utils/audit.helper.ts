import { prisma } from "@/config/lib/prisma";

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "ERROR"
  | "AUTH_FAILED"
  | "CONSULTA_AI";

/**
 * Registra una acción de auditoría de forma inmutable en la tabla AuditLog.
 *
 * Este helper nunca debe interrumpir el flujo principal de la petición: si el
 * registro de auditoría falla (por ejemplo, un problema puntual de base de datos),
 * el class se captura y se reporta por consola, pero no se relanza.
 *
 * @param userId    Id del usuario autenticado que ejecuta la acción.
 * @param accion    Nombre de la acción realizada (ej: "LOGIN", "CONSULTA_IA", "MODIFICACION_PACIENTE").
 * @param entidad   Entidad de negocio afectada (ej: "User", "Paciente", "Consulta").
 * @param entidadId Id del registro afectado dentro de esa entidad (si aplica).
 * @param detalle   Texto descriptivo adicional para trazabilidad humana.
 */
export const logAudit = async (
  userId: number | undefined,
  accion: AuditAction,
  entidad: string,
  entidadId?: number,
  detalle?: string
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        accion,
        entidad,
        entidadId: entidadId ?? null,
        detalle: detalle ?? "",
      },
    });
  } catch (error) {
    console.error("[AuditLog] Error al registrar auditoría:", error);
  }
};
