import { Request, Response, NextFunction } from "express";

// TODO: Implementar middleware de autenticación por JWT (RF-03)
export const authenticate = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

// TODO: Implementar middleware de autorización por rol (RF-04)
export const checkRole = (_allowedRoles: string[]) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
