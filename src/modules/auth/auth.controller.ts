import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  static async loginOfUserFromController(request: Request, response: Response) {
    try {
      const { token, id } = await AuthService.CheckLoginUserFromService(request.body);

      return response
        .status(200)
        .json({ message: "Has iniciado sesión correctamente.", token, id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(401).json({ message: error.message });
      }
      return response
        .status(500)
        .json({ message: "Error interno en el servidor al procesar la autenticación." });
    }
  }
}
