import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  });
  
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { firstName, lastName, age, grade, city, schoolName, bio } = req.body;
  
  const profile = await prisma.profile.update({
    where: { userId },
    data: { firstName, lastName, age, grade, city, schoolName, bio }
  });
  
  res.json(profile);
});

export default router;