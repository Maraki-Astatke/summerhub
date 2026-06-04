import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/roles', authenticateToken, requireRole(['admin']), async (req, res) => {
  const roles = await prisma.role.findMany();
  res.json(roles);
});

export default router;