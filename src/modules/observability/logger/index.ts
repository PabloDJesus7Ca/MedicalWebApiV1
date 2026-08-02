import pino from "pino";
import PackageJson from "../../../../package.json" with { type: "json" };

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "password",
      "*.sensitive",
      "token",
      "authorization",
      "apiKey",
      "secret",
      "documento",
      "diagnostico",
      "sintomas",
      "resultado",
      "*.laboratorios[*].resultado",
    ],
    censor: "[REDACTED]",
    remove: true,
  },
  transport: {
    targets: [
      {
        target: "pino-pretty", // Imprime en la consola (terminal)
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
      {
        target: "pino-loki", // Envía a Grafana
        options: {
          batching: true,
          interval: 5,
          host: "http://localhost:3100",
          labels: { app: PackageJson.name },
          tenantId: "tenant1",
        },
      },
    ],
  },
  formatters: {
    bindings: ({ pid, hostname }) => {
      return {
        pid,
        hostname,
        service: PackageJson.name,
        version: PackageJson.version,
        enviroment: process.env.NODE_ENV ?? "development",
      };
    },
  },
});
