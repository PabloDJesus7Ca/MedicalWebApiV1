import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./configurations/swagger";
import cors from "cors";
import helmet from "helmet";
import { config } from "./configurations/configs";
import { checkDomianServerCors } from "./Shared/middlewares/checkDomainsServer";
import routes from "./routes/agent.routes";
import routesAuth from "./modules/auth/auth.routes"
import { errorHandler } from "./Shared/middlewares/errorHandlerGlobal";
const app: Express = express();

app.use(
  cors(
    checkDomianServerCors({
      ListOfDomainType: ["http://localhost:3012", "http://localhost:3003", "http://localhost:5675"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(helmet());
app.use(express.json());

app.use("/api", routes);
app.use("/api", routesAuth);

app.get("/health", (_, response) => {
  response.status(200).json({ message: "Server On ago" });
});

app.use("/*path", (_, response) => {
  response.status(404).json({ message: "Route Not Found" });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`
        El Servidor Esta Prendido En http://localhost:${config.PORT}`);
});
