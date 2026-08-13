import { Response, NextFunction } from "express";
import { Request } from "express";
import { JwtPayload } from "@shared/model/jwt-payload.model";
import { VerifyToken } from "@shared/utils/jwt.helper";
import { Rol } from "@generated/prisma/index.js";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const middlewareAuth = (
  request: AuthRequest,
  response: Response,
  next: NextFunction
): void => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logAudit(undefined, "AUTH_FAILED", "Auth", undefined, "Token no proporcionado");
    logger.warn({ accion: "AUTH_FAILED_NO_TOKEN" }, "Petición rechazada: Token no proporcionado");
    response.status(401).json({
      message: "Acceso denegado. Token de autenticación no proporcionado.",
    });
    return;
  }
  const token = authHeader.split(" ")[1];

  if (!token) {
    logAudit(undefined, "AUTH_FAILED", "Auth", undefined, "Token vacío");
    logger.warn({ accion: "AUTH_FAILED_EMPTY_TOKEN" }, "Petición rechazada: Token vacío");
    response
      .status(401)
      .json({ message: "Acceso denegado. Token de autenticación no proporcionado." });
    return;
  }

  try {
    request.user = VerifyToken(token);
    next();
  } catch (error) {
    logAudit(undefined, "AUTH_FAILED", "Auth", undefined, "Token inválido o expirado");
    logger.warn(
      { accion: "AUTH_FAILED_INVALID_TOKEN", error },
      "Petición rechazada: Token inválido o expirado"
    );
    response.status(401).json({ message: "Acceso denegado. Token inválido o expirado." });
  }
};

export const checkRoleMiddleware = (...allowedRoles: Rol[]) => {
  return (request: AuthRequest, response: Response, next: NextFunction): void => {
    if (!request.user) {
      logAudit(undefined, "AUTH_FAILED", "Auth", undefined, "No autenticado — checkRole");
      logger.warn(
        { accion: "AUTH_FAILED_NO_USER_ROLE" },
        "Petición rechazada en checkRole: Usuario no autenticado"
      );
      response.status(401).json({ message: "Acceso denegado. Usuario no autenticado." });
      return;
    }
    if (!allowedRoles.includes(request.user.rol as Rol)) {
      logAudit(
        request.user.id,
        "AUTH_FAILED",
        "Auth",
        undefined,
        `El usuario ${request.user.nombre || request.user.id} intentó acceder a una ruta protegida (requiere: ${allowedRoles.join(",")})`
      );
      logger.warn(
        {
          usuario_id: request.user.id,
          usuario_nombre: request.user.nombre,
          rol_actual: request.user.rol,
          roles_requeridos: allowedRoles,
          accion: "AUTH_FAILED_FORBIDDEN",
        },
        `Acceso denegado (403): ${request.user.nombre || request.user.id} intentó acceder a ruta protegida.`
      );
      response.status(403).json({
        message: "Acceso denegado. No tienes los permisos necesarios para realizar esta acción.",
      });
      return;
    }
    next();
  };
};
