import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { getTeachers, getSellers, getStudents } from "../controllers/usersController.js";

const router = Router();

router.get('/teachers', authenticateToken, getTeachers);

router.get('/sellers', authenticateToken, getSellers);

router.get('/students', authenticateToken, getStudents);

export default router;
