import { UserResponses } from "../../Shared/Errors/LoginError";
import { ResponseUserDto } from "./usuarios.model";
import { usuariosRepositorio } from "./usuarios.repositories";

export class UsuarioService {
  static async CheckUserFromServiceForId(id: number): Promise<ResponseUserDto> {
    const UserExist = await usuariosRepositorio.GetUserByIdGeneral(id);

    if (!UserExist) {
      throw new UserResponses("Lo Sentimos No Pudimos Encontrar A Este Usuario");
    }
    return {
      id: UserExist.id,
      nombre: UserExist.nombre,
      email: UserExist.email,
      rol: UserExist.rol,
    };
  }
}
