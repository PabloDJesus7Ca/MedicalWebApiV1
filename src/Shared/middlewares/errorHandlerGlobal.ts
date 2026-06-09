import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  console.error(error.message);
  response.status(error.status ?? 500).json({
    message: error.message ?? "Error Internal From The Server Please Contact To The Admin",
  });
};
