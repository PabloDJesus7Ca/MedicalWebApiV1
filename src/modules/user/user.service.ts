import { prisma } from "@config/lib/prisma";
import { hashdPassword } from "@shared/utils/password.helper";
import { CreateUserAllowedForAdmin, UpdateUsuarioAdminDto } from "./user.dto";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

const usuarioSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  creadoEn: true,
} as const;

export class AdminUsuariosService {
  // TODO: Lógica para leer logs de auditoría inmutables y actualizar configuración de IA (RF-24 a RF-28).

  /** Crea un nuevo usuario (médico o administrador). Solo accesible por un ADMIN. */
  static async crearUsuario(
    data: CreateUserAllowedForAdmin,
    adminUser: { id: number; nombre?: string }
  ) {
    const existente = await prisma.user.findUnique({ where: { email: data.email } });
    if (existente) {
      throw new Error("Ya existe un usuario registrado con este correo electrónico.");
    }

    const usuario = await prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: await hashdPassword(data.password),
        rol: data.rol,
      },
      select: usuarioSelect,
    });

    await logAudit(
      adminUser.id,
      "CREATE",
      "User",
      usuario.id,
      `Admin ${adminUser.nombre || adminUser.id} registró al nuevo ${data.rol}: ${data.email}`
    );

    logger.info(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "CREATE_USER",
        nuevo_usuario: data.email,
        nuevo_rol: data.rol,
      },
      `Admin ${adminUser.nombre || adminUser.id} registró a un nuevo usuario (${data.rol}).`
    );

    return usuario;
  }

  /** Lista todos los usuariosDelte del sistema, sin exponer la contraseña. */
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
  static async actualizarUsuario(
    id: number,
    data: UpdateUsuarioAdminDto,
    adminUser: { id: number; nombre?: string }
  ) {
    const usuario = await prisma.user.findUnique({ where: { id } });
    if (!usuario) {
      throw new Error("Usuario no encontrado.");
    }

    if (data.email && data.email !== usuario.email) {
      const emailTomado = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTomado) {
        throw new Error("El correo electrónico ingresado ya está en uso por otro usuario.");
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: data as any,
      select: usuarioSelect,
    });

    const cambios = Object.entries(data)
      .map(([k, v]) => `${k}:${v}`)
      .join(", ");
    await logAudit(
      adminUser.id,
      "UPDATE",
      "User",
      id,
      `Admin ${adminUser.nombre || adminUser.id} actualizó/suspendió al usuario #${id}: ${cambios}`
    );
    logger.warn(
      {
        admin_id: adminUser.id,
        admin_nombre: adminUser.nombre,
        accion: "UPDATE_USER_OR_SUSPEND",
        usuario_id: id,
      },
      `Admin ${adminUser.nombre || adminUser.id} modificó credenciales o estado del usuario #${id}.`
    );

    return updated;
  }
}
