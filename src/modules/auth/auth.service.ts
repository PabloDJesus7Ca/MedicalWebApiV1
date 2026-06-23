import { AuthRepository } from "./auth.repositories";
import { UserResponses } from "../../Shared/Errors/LoginError";
import { hashdPassword, VerifyPassword } from "../../Shared/utils/password.helper.user";
import { CheckTypeLoginDto, CreateUserDto } from "./auth.models.user";
import { ResponseCreateUserDto } from "./auth.types.user";
import { ShowRealResponseToUser } from "./auth.fn.model";

export class AuthService {
  static async createNewUserFromService(data: CreateUserDto): Promise<ResponseCreateUserDto> {
    const userExist = await AuthRepository.CheckUser(data.email);

    if (userExist) {
      throw new UserResponses("Este Cuenta Ya Existe Ha Sido Tomada Por Un Usuario");
    }

    const createdUser = await AuthRepository.CreateUser({
      nombre: data.nombre,
      email: data.email,
      password: await hashdPassword(data.password),
      rol: data.rol,
    });

    const user = ShowRealResponseToUser(createdUser);
    return user;
  }

  static async CheckLoginUserFromService(user: CheckTypeLoginDto): Promise<boolean> {
    const userExist = await AuthRepository.CheckUser(user.email);
    const passwordUser = await VerifyPassword(user.password, userExist?.password!);

    if (userExist?.email !== user.email) {
      throw new UserResponses("Este Email Es Incorrecto");
    }

    if (passwordUser === false) {
      throw new UserResponses("Esta Contrasena Es Incorrecta");
    }
    return true;
  }
  // TODO: Implementar lógica de validación de credenciales y firma de JWT (RF-01, RF-02)
}
