import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  // TODO: Implementar controlador de login (RF-01, RF-02)
  static async loginOfUserFromController(request: Request, response: Response) {
    try {
      const { token, id } = await AuthService.CheckLoginUserFromService(request.body);

      return response
        .status(200)
        .json({ message: "Haz Iniciado Session Correctamente", token, id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error Desconocido" });
    }
  }

  static async RegisterNewUserFromController(request: Request, response: Response) {
    try {
      const NewUser = await AuthService.createNewUserFromService(request.body);

      return response.status(201).json({ NewUser });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(400).json({
          message: error.message,
        });
      }
      return response.status(500).json({ message: "Unknow error" });
    }
  }
}
