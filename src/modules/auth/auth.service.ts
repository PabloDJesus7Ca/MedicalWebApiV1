import { AuthRepository } from "./auth.repositories";
import { UserResponses } from "../../Shared/Errors/LoginError";
import { hashdPassword, VerifyPassword } from "../../Shared/utils/password.helper.user";
import { CheckTypeLoginDto, CreateUserDto } from "./auth.models.user";
import { ResponseCreateUserDto, LoginResponseDto } from "./auth.types.user";
import { ShowRealResponseToUser } from "./auth.fn.model";
import { SingToken } from "../../Shared/utils/jwt.helper";
import { logAudit } from "../../Shared/utils/audit.helper";

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

    await logAudit(createdUser.id, 'CREATE', 'User', createdUser.id, `Usuario ${data.email} registrado con rol ${data.rol}`);

    const user = ShowRealResponseToUser(createdUser);
    return user;
  }

  static async CheckLoginUserFromService(user: CheckTypeLoginDto): Promise<LoginResponseDto> {
    const userExist = await AuthRepository.CheckUser(user.email);
    if (!userExist) {
      throw new UserResponses("Este Email Es Incorrecto");
    }

    const passwordUser = await VerifyPassword(user.password, userExist.password);

    if (passwordUser === false) {
      throw new UserResponses("Esta Contrasena Es Incorrecta");
    }

    const token = SingToken({
      id: userExist.id,
      email: userExist.email,
      rol: userExist.rol,
    });

    await logAudit(userExist.id, "LOGIN", "User", userExist.id, `Inicio de sesión de ${userExist.email}`);

    return { token, id: userExist.id };
    // TODO: Implementar lógica de validación de credenciales y firma de JWT (RF-01, RF-02)
  }
}
