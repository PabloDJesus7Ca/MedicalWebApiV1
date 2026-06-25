import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "../types/model.jwt.payload";
import { VeriyToken } from "../utils/jwt.helper";
import { Rol } from "../../generated/prisma";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
// TODO: Implementar middleware de autenticación por JWT (RF-03)
export const authMiddleware = (request: AuthRequest, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Token No Porporcionado",
    });
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    return response.status(401).json({ message: "Token no proporcionado" });
  }

  try {
    const payload = VeriyToken(token);
    request.user = payload;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Token inválido o expirado" });
  }
};

// TODO: Implementar middleware de autorización por rol (RF-04)
export const checkRoleMiddleware = (...allowedRoles: Rol[]) => {
  return (request: AuthRequest, response: Response, next: NextFunction) => {
    if (!request.user) {
      return response.status(401).json({ message: "No Autenticado" });
    }
    if (!allowedRoles.includes(request.user.rol as Rol)) {
      return response
        .status(403)
        .json({ message: "No tienes permiso para acceder a este recurso" });
    }
    next();
  };
};
