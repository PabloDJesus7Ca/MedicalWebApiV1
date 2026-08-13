import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { logger } from "@modules/observability/logger";
import { AuthRequest } from "./auth.middleware";

export const LoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message:
    "Se ha excedido el límite de intentos de inicio de sesión desde esta dirección IP. Por favor, inténtalo de nuevo más tarde.",
  statusCode: 429,
  handler: (req, res, _next, options) => {
    logger.warn(
      { ip: req.ip, endpoint: req.originalUrl, accion: "RATE_LIMIT_LOGIN" },
      "Alerta: Posible ataque de fuerza bruta detectado en el login."
    );
    res.status(options.statusCode).send({ message: options.message });
  },
});

export const ConsultaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: AuthRequest) => {
    return req.user?.id ? req.user.id.toString() : ipKeyGenerator(req.ip ?? "");
  },
  message:
    "Has alcanzado el límite de consultas permitidas por hora. Por favor, inténtalo de nuevo más tarde.",
  statusCode: 429,
  handler: (req: AuthRequest, res, _next, options) => {
    logger.warn(
      {
        ip: req.ip,
        endpoint: req.originalUrl,
        usuario_id: req.user?.id,
        accion: "RATE_LIMIT_CONSULTA",
      },
      "Alerta: Límite de consultas a la IA excedido."
    );
    res.status(options.statusCode).send({ message: options.message });
  },
});
