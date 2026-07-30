import { Router } from "express";
import routesAgent from "@modules/agent/agent.routes";
import routesAuth from "@modules/auth/auth.routes";
import routesPacientes from "@modules/patient/patient.routes";
import routesConsulta from "@modules/consultation/consultation.routes";
import routesChatbot from "@modules/chatbot/chatbot.routes";
import routesAdmin from "@modules/admin/admin.routes";

const routerApp: Router = Router();

routerApp.use("/model", routesAgent);
routerApp.use("/auth", routesAuth);
routerApp.use("/pacientes", routesPacientes);
routerApp.use("/admin", routesAdmin);
routerApp.use("/consulta", routesConsulta);
routerApp.use("/chatbot", routesChatbot);

export default routerApp;
