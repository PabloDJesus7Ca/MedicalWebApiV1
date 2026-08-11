import express from "express";
import swaggerUi from "swagger-ui-express";
import routerApp from "@routes/app.routes";
import { checkDomainServerCors } from "@shared/middleware/domain.middleware";
import { errorHandler } from "@shared/middleware/error.middleware";
import { swaggerSpec } from "@/config/swagger.config";
import { configSystem } from "@/config/system.config";
import cors from "cors";
import helmet from "helmet";
import { logger } from "@modules/observability/logger";
import { metricsEndpoint, metricsMiddleware } from "@modules/observability/metrics";

const app = express();

app.use(
  cors(
    checkDomainServerCors({
      ListOfDomainType: [
        "http://localhost:3006",
        "http://localhost:3012",
        "http://localhost:3003",
        "http://localhost:5675",
        "http://localhost:3007",
        "http://localhost:3000",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(express.json());

app.use(metricsMiddleware);
app.get("/metrics", metricsEndpoint);
app.use("/api", routerApp);

app.get("/health", (_, response) => {
  response.status(200).json({ message: "El servidor está en ejecución." });
});

app.use("/*path", (_, response) => {
  response.status(404).json({ message: "Ruta no encontrada en el servidor." });
});

app.use(errorHandler);

app.listen(configSystem.PORT, () => {
  logger.info(`MedicalWebApiV1 running at:${configSystem.PORT}`);
});
