import { Router } from "express";
import { UserControllerAi } from "../controllers/consult.response.ai.controller";
const routes: Router = Router();

routes.post("/chat", UserControllerAi.Chat);

export default routes;
