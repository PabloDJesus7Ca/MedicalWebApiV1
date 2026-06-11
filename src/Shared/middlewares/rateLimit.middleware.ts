import { Request, Response, NextFunction } from "express";

// TODO: Implementar limitador de peticiones en memoria para login y consultas (BE-21, RNF-07)
export const rateLimiter = (_limit: number, _timeframeMs: number) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    next();
  };
};
