import { UsuarioService } from "./usuarios.service";
import { Response, Request } from "express";
export class UsuariosControl {
  static async GetUserByIdFoundFromControl(request: Request, response: Response) {
    try {
      const id = Number(request.params.id);

      if (isNaN(id)) {
        return response.status(400).json({ message: "ID de usuario inválido o no proporcionado." });
      }
      const userLookingFor = await UsuarioService.CheckUserFromServiceForId(id);
      return response.status(200).json({ user: userLookingFor });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return response.status(404).json({ message: error.message });
      }
      return response.status(500).json({ message: "Error desconocido." });
    }
  }
}
