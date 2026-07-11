import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getRoles } from "../controllers/rolesController.js";
const router = Router();
router.get('/roles', authenticateToken, requireRole(['admin']), getRoles);
export default router;
