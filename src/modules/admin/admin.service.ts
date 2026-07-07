import { prisma } from "../../configurations/lib/prisma";
import { AuditLog } from "../../generated/prisma";

export interface LogFilters {
  usuario?: string;
  fecha?: string;
  tipoAccion?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class AdminService {
  public static async getLogsPaged(
    page: number,
    pageSize: number,
    filters: LogFilters = {}
  ): Promise<PaginatedResult<AuditLog>> {
    const offset = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filters.tipoAccion) {
      where.accion = { contains: filters.tipoAccion, mode: 'insensitive' };
    }

    if (filters.usuario) {
      where.user = {
        OR: [
          { nombre: { contains: filters.usuario, mode: 'insensitive' } },
          { email: { contains: filters.usuario, mode: 'insensitive' } },
        ],
      };
    }

    if (filters.fecha) {
      const date = new Date(filters.fecha);
      if (!isNaN(date.getTime())) {
        const inicio = new Date(date.setHours(0, 0, 0, 0));
        const fin = new Date(date.setHours(23, 59, 59, 999));
        where.createdAt = { gte: inicio, lte: fin };
      }
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: pageSize,
        include: { user: { select: { id: true, nombre: true, email: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: data as unknown as AuditLog[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
