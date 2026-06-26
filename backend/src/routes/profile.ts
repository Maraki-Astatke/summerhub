import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { getProfile, putProfile } from "../controllers/profileController.js";

const router = Router();

router.get('/profile', authenticateToken, getProfile);

router.put('/profile', authenticateToken, putProfile);

export default router;
