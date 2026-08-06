import { ErrorRequestHandler, NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";
import { logAudit } from "@shared/utils/audit.helper";
import { logger } from "@modules/observability/logger";

export const isProduction = process.env.NODE_ENV === "production";

if (process.env.NODE_ENV === "development") {
  console.log("Servidor corriendo en desarrollo");
}
export interface AppError extends Error {
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  request: AuthRequest,
  response: Response,
  _next: NextFunction
) => {
  logger.error(
    { accion: "SERVER_ERROR", error: error.message, stack: error.stack },
    `Error fatal capturado (Status: ${error.status ?? 500})`
  );

  const userId = request.user?.id ?? undefined;
  logAudit(userId, "ERROR", "System", undefined, `Error ${error.status ?? 500}: ${error.message}`);

  const status = error.status ?? 500;
  const safeMessage = status === 500 
    ? "Error interno del servidor. Por favor, contacta al administrador." 
    : error.message;

  response.status(status).json({
    message: safeMessage
  });
};
