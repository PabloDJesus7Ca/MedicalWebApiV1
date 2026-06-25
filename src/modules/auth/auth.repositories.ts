import { prisma } from "../../../src/configurations/lib/prisma";
import { CreateUserDto } from "./auth.models.user";
export class AuthRepository {
  static async LoginAuth(email: string, password: string) {
    return await prisma.user.findUniqueOrThrow({
      where: {
        email,
        password,
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

  static async CreateUser(data: CreateUserDto) {
    return await prisma.user.create({ data });
  }
}
