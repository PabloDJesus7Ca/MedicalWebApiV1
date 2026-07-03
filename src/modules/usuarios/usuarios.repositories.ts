import { prisma } from "../../configurations/lib/prisma";

export class usuariosRepositorio {
  static async GetUserByIdGeneral(id: number) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
      },
    });
  }
}
