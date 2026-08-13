import { prisma } from "@/config/lib/prisma";
import { AuditLog } from "@generated/prisma/index.js";

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

export interface Metricas {
  totalConsultas: number;
  tokensConsumidos: number;
  usuariosActivos: number;
  tasaErrores: number;
  actividadPorDia: { fecha: string; consultas: number; tokens: number }[];
  distribucionAcciones: { accion: string; cantidad: number }[];
}

export class LogsService {
  public static async getMetricas(): Promise<Metricas> {
    const [
      totalConsultas,
      tokensAgg,
      usuariosActivos,
      totalLogs,
      erroresLogs,
      distribucionAccionesDb,
    ] = await Promise.all([
      prisma.consulta.count(),
      prisma.consulta.aggregate({ _sum: { tokens: true } }),
      prisma.user.count({ where: { activo: true } }),
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { accion: { in: ["ERROR", "AUTH_FAILED"] } },
      }),
      prisma.auditLog.groupBy({
        by: ["accion"],
        _count: { accion: true },
        orderBy: { _count: { accion: "desc" } },
      }),
    ]);

    const tasaErrores = totalLogs > 0 ? Math.round((erroresLogs / totalLogs) * 100) : 0;

    const distribucionAcciones = distribucionAccionesDb.map((d) => ({
      accion: d.accion,
      cantidad: d._count.accion,
    }));

    const ultimos7Dias = Array.from({ length: 7 }, (_, i) => {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (6 - i));
      return fecha;
    });

    const actividadPorDiaPromesas = ultimos7Dias.map(async (fecha) => {
      const inicio = new Date(fecha.setHours(0, 0, 0, 0));
      const fin = new Date(fecha.setHours(23, 59, 59, 999));

      const stats = await prisma.consulta.aggregate({
        where: { createdAt: { gte: inicio, lte: fin } },
        _count: { id: true },
        _sum: { tokens: true },
      });

      return {
        fecha: inicio.toISOString().split("T")[0] ?? "",
        consultas: stats._count.id,
        tokens: stats._sum.tokens ?? 0,
      };
    });

    const actividadPorDia = await Promise.all(actividadPorDiaPromesas);

    return {
      totalConsultas,
      tokensConsumidos: tokensAgg._sum.tokens ?? 0,
      usuariosActivos,
      tasaErrores,
      actividadPorDia,
      distribucionAcciones,
    };
  }

  public static async getLogsPaged(
    page: number,
    pageSize: number,
    filters: LogFilters = {}
  ): Promise<PaginatedResult<AuditLog>> {
    const offset = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (filters.tipoAccion) {
      where.accion = { contains: filters.tipoAccion, mode: "insensitive" };
    }

    if (filters.usuario) {
      where.user = {
        OR: [
          { nombre: { contains: filters.usuario, mode: "insensitive" } },
          { email: { contains: filters.usuario, mode: "insensitive" } },
        ],
      };
    }

    if (filters.fecha) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(filters.fecha);
      if (match) {
        const [, year = 0, month = 1, day = 1] = match.map(Number);
        where.createdAt = {
          gte: new Date(year, month - 1, day, 0, 0, 0, 0),
          lte: new Date(year, month - 1, day, 23, 59, 59, 999),
        };
      }
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
