import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./configs";

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
        url: `http://localhost:${config.PORT}/api`,
      },
    ],
  },

  apis: ["./src/routes/*.ts", "./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
