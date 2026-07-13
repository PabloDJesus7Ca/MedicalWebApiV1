import { prisma } from "../../../configurations/lib/prisma";
import { hashdPassword } from "../../../Shared/utils/password.helper.user";
import { CreateUsuarioAdminDto, UpdateUsuarioAdminDto } from "./admin.dto";
import { logAudit } from "../../../Shared/utils/audit.helper";

const usuarioSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  creadoEn: true,
} as const;

export class AdminUsuariosService {
    // Nunca se selecciona `password` para que jamás salga del backend hacia el cliente.

  // TODO: Lógica para leer logs de auditoría inmutables y actualizar configuración de IA (RF-24 a RF-28).

  /** Crea un nuevo usuario (médico o administrador). Solo accesible por un ADMIN. */
  static async crearUsuario(data: CreateUsuarioAdminDto, adminUserId: number) {
    const existente = await prisma.user.findUnique({ where: { email: data.email } });
    if (existente) {
      throw new Error("Ya existe un usuario registrado con ese email.");
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

    await logAudit(adminUserId, 'CREATE', 'User', usuario.id, `Usuario ${data.email} creado con rol ${data.rol}`);

    return usuario;
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
  static async actualizarUsuario(id: number, data: UpdateUsuarioAdminDto, adminUserId: number) {
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

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: usuarioSelect,
    });

    const cambios = Object.entries(data).map(([k, v]) => `${k}:${v}`).join(', ');
    await logAudit(adminUserId, 'UPDATE', 'User', id, `Usuario #${id} actualizado: ${cambios}`);

    return updated;
  }
}
