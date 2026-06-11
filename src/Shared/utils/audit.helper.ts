// TODO: Helper para registrar logs de auditoría inmutables en la base de datos (BE-16)
export const logAudit = async (
  userId: number,
  accion: string,
  entidad: string,
  _entidadId?: number,
  _detalle?: string
) => {
  console.log(`[AuditLog] Usuario ${userId} ejecutó ${accion} en ${entidad}`);
};
