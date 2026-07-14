import { Router } from "express";
import users from './usuarios/usuarios.routes'
import logs from './admin-logs/log.routes'
import iaConfig from './ia-config/ia-config.routes'

const router: Router = Router();

router.use('/users', users)
router.use('/logs', logs)
router.use('/config', iaConfig)

export default router;
