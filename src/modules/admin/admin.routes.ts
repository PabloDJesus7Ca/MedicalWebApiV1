import { Router } from "express";
import users from './usuarios/usuarios.routes'
import logs from './admin-logs/log.routes'

const router: Router = Router();

router.use('/users', users)
router.use('/logs', logs)
// TODO: Implementar rutas de logs de auditoría y configuración de IA (RF-25 a RF-28)

export default router;
