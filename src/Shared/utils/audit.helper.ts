import { prisma } from "../../configurations/lib/prisma";

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'ERROR'
  | 'AUTH_FAILED'
  | 'CONSULTA_AI'

export const logAudit = async (
  userId: number,
  accion: AuditAction,
  entidad: string,
  entidadId?: number,
  detalle?: string
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        accion,
        entidad,
        entidadId: entidadId ?? null,
        detalle: detalle ?? '',
      },
    });
  } catch (error) {
    console.error('[AuditLog] Error al registrar auditoría:', error);
  }
};
