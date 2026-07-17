// TODO: Implementar limitador de peticiones en memoria para login y consultas (BE-21, RNF-07)
import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const LoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Estamos experimentando muchas solicitudes desde esta IP, por favor intente más tarde.",
  statusCode: 429,
});

export const ConsultaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => {

    return req.user?.id ? req.user.id.toString() : ipKeyGenerator(req.ip);
  },
  message: "Ha alcanzado el límite de consultas por hora, por favor intente más tarde.",
  statusCode: 429,
});
