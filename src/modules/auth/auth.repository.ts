import { prisma } from "@/config/lib/prisma";

export class AuthRepository {
  static async LoginAuth(email: string) {
    return await prisma.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
  }

  static async CheckUser(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
