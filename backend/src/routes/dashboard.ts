import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getDashboardStats, getDashboardProgress, getDashboardCertificates, getDashboardAchievements, putProfile, getProfile } from "../controllers/dashboardController.js";

const router = Router();

router.get('/dashboard/stats',
  authenticateToken,
  requireRole(['student', 'scholar']), getDashboardStats
);

router.get('/dashboard/progress',
  authenticateToken,
  requireRole(['student', 'scholar']), getDashboardProgress
);

router.get('/dashboard/certificates',
  authenticateToken,
  requireRole(['student', 'scholar']), getDashboardCertificates
);

router.get('/dashboard/achievements',
  authenticateToken,
  requireRole(['student', 'scholar']), getDashboardAchievements
);

router.put('/profile',
  authenticateToken, putProfile
);

router.get('/profile',
  authenticateToken, getProfile
);

export default router;
