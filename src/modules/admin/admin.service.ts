import { prisma } from "../../configurations/lib/prisma";
import { AuditLog } from "../../generated/prisma";
import { hashdPassword } from "../../Shared/utils/password.helper.user";
import { CreateUsuarioAdminDto, UpdateUsuarioAdminDto } from "./admin.dto";

const usuarioSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  creadoEn: true,
} as const;


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
  // Nunca se selecciona `password` para que jamás salga del backend hacia el cliente.

  // TODO: Lógica para leer logs de auditoría inmutables y actualizar configuración de IA (RF-24 a RF-28).

  /** Crea un nuevo usuario (médico o administrador). Solo accesible por un ADMIN. */
  static async crearUsuario(data: CreateUsuarioAdminDto) {
    const existente = await prisma.user.findUnique({ where: { email: data.email } });
    if (existente) {
      throw new Error("Ya existe un usuario registrado con ese email.");
    }

    return await prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: await hashdPassword(data.password),
        rol: data.rol,
      },
      select: usuarioSelect,
    });
  }

  /** Lista todos los usuarios del sistema, sin exponer la contraseña. */
  static async listarUsuarios() {
    return await prisma.user.findMany({
      select: usuarioSelect,
      orderBy: { creadoEn: "desc" },
    });
  }

  /** Obtiene un único usuario por su ID. */
  static async obtenerUsuarioPorId(id: number) {
    const usuario = await prisma.user.findUnique({ where: { id }, select: usuarioSelect });
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }
    return usuario;
  }

  /**
   * Edita los datos de un usuario. También se usa para desactivarlo:
   * basta con enviar `{ activo: false }` en el body.
   */
  static async actualizarUsuario(id: number, data: UpdateUsuarioAdminDto) {
    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    if (data.email && data.email !== usuario.email) {
      const emailTomado = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTomado) {
        throw new Error("Ese email ya está en uso por otro usuario.");
      }
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: usuarioSelect,
    });
  }
}
