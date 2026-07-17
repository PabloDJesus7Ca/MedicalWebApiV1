import { Response, NextFunction } from "express";
import { Request } from "express";
import { JwtPayload } from "../types/model.jwt.payload";
import { VeriyToken } from "../utils/jwt.helper";
import { Rol } from "../../generated/prisma";
import { logAudit } from "../utils/audit.helper";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = (
  request: AuthRequest,
  response: Response,
  next: NextFunction
): void => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logAudit(undefined, 'AUTH_FAILED', 'Auth', undefined, 'Token no proporcionado');
    response.status(401).json({
      message: "Token No Porporcionado",
    });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    logAudit(undefined, 'AUTH_FAILED', 'Auth', undefined, 'Token vacío');
    response.status(401).json({ message: "Token no proporcionado" });
    return;
  }

  try {
    request.user = VeriyToken(token);
    next();
  } catch (error) {
    logAudit(undefined, 'AUTH_FAILED', 'Auth', undefined, 'Token inválido o expirado');
    response.status(401).json({ message: "Token inválido o expirado" ,error});
  }
};

export const checkRoleMiddleware = (...allowedRoles: Rol[]) => {
  return (request: AuthRequest, response: Response, next: NextFunction): void => {
    if (!request.user) {
      logAudit(undefined, 'AUTH_FAILED', 'Auth', undefined, 'No autenticado — checkRole');
      response.status(401).json({ message: "No Autenticado" });
      return;
    }
    if (!allowedRoles.includes(request.user.rol as Rol)) {
      logAudit(
        request.user.id,
        'AUTH_FAILED',
        'Auth',
        undefined,
        ` Rol ${request.user.rol} no autorizado para recurso`
      );
      response.status(403).json({ message: "No tienes permiso para acceder a este recurso" });
      return;
    }
    next();
  };
};
