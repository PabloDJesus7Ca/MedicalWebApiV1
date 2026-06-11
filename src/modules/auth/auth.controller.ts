import { Request, Response, NextFunction } from "express";

export class AuthController {
  // TODO: Implementar controlador de login (RF-01, RF-02)
  static async login(_req: Request, res: Response, next: NextFunction) {
    try {
      res.status(501).json({ message: "No implementado" });
    } catch (error) {
      next(error);
    }
  }
}
