import swaggerJsdoc from "swagger-jsdoc";
import { configSystem } from "@/config/system.config";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Asistente Medico Ai",
      version: "1.0.0",
      description: "Documentación de la API",
    },
    servers: [
      {
        url: `http://localhost:${configSystem.PORT}/api`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  apis: ["./src/routes/*.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
