import client from "prom-client";
import { NextFunction, Request, Response } from "express";

const collectDefaultMetrics = client.collectDefaultMetrics;
export const register = new client.Registry();

collectDefaultMetrics({ register });

export const httpRequestCount = new client.Counter({
  name: "http_request_count",
  help: "Total de peticiones HTTP recibidas",
  labelNames: ["method", "route", "status"] as const,
  registers: [register],
});

export const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duración de las peticiones HTTP en segundos",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5],
  registers: [register],
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTimer = httpRequestDurationMicroseconds.startTimer();

  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path;

    httpRequestCount.labels(req.method, route, res.statusCode.toString()).inc();

    startTimer({ method: req.method, route, status: res.statusCode.toString() });
  });

  next();
};

export const metricsEndpoint = async (_req: Request, res: Response) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
};
