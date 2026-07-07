import { Response, NextFunction, ErrorRequestHandler } from "express";
import { AuthRequest } from "./auth.middleware";
import { logAudit } from "../utils/audit.helper";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  request: AuthRequest,
  response: Response,
  _next: NextFunction
) => {
  console.error(error.message);

  const userId = request.user?.id ?? 0;
  logAudit(userId, 'ERROR', 'System', undefined, `Error ${error.status ?? 500}: ${error.message}`);

  response.status(error.status ?? 500).json({
    message: error.message ?? "Error Internal From The Server Please Contact To The Admin",
  });
};
