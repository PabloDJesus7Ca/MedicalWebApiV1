import { Router } from "express";
import users from "@modules/user/user.routes";
import logs from "./audit/audit.routes";
import aiConfig from "./ai-config/ai-config.routes";

const router: Router = Router();

router.use("/usuarios", users);
router.use("/logs", logs);
router.use("/configSystem", aiConfig);

export default router;
