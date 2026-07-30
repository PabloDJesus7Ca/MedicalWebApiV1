import { AuthRepository } from "./auth.repository";
import { UserResponse } from "@shared/class/custom-error.class";
import { VerifyPassword } from "@shared/utils/password.helper";
import { CheckTypeLoginDto, LoginResponseDto } from "./auth.dto";
import { SingToken } from "@shared/utils/jwt.helper";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

export class AuthService {
  static async CheckLoginUserFromService(user: CheckTypeLoginDto): Promise<LoginResponseDto> {
    const userExist = await AuthRepository.CheckUser(user.email);
    if (!userExist) {
      await logAudit(undefined, "AUTH_FAILED", "User", undefined, `Intento de login con email inexistente: ${user.email}`);
      logger.warn({ email: user.email, accion: "LOGIN_FAILED_NO_USER" }, `Intento de login fallido: email inexistente (${user.email})`);
      throw new UserResponse(
        "Credenciales inválidas. El correo electrónico o la contraseña son incorrectos."
      );
    }

    const passwordUser = await VerifyPassword(user.password, userExist.password);

    if (!passwordUser) {
      await logAudit(userExist.id, "AUTH_FAILED", "User", userExist.id, `Contraseña incorrecta ingresada para Dr(a). ${userExist.nombre}`);
      logger.warn({ doctor_id: userExist.id, email: userExist.email, accion: "LOGIN_FAILED_WRONG_PASS" }, `Intento de login fallido: contraseña incorrecta para ${userExist.nombre}`);
      throw new UserResponse(
        "Credenciales inválidas. El correo electrónico o la contraseña son incorrectos."
      );
    }

    const token = SingToken({
      id: userExist.id,
      email: userExist.email,
      nombre: userExist.nombre,
      rol: userExist.rol,
    });

    await logAudit(
      userExist.id,
      "LOGIN",
      "User",
      userExist.id,
      `Dr(a). ${userExist.nombre} ha iniciado sesión con éxito`
    );

    logger.info({ doctor_id: userExist.id, doctor_nombre: userExist.nombre, accion: "LOGIN_SUCCESS" }, `Dr(a). ${userExist.nombre} inició sesión con éxito.`);

    return { token, id: userExist.id };
  }
}
