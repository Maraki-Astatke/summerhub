import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching teachers for user:', userId);
    
    const teachers = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: userId },
        roles: {
          some: {
            role: {
              name: 'teacher'
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    console.log(`Found ${teachers.length} teachers`);
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

router.get('/sellers', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const sellers = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: userId },
        roles: {
          some: {
            role: {
              name: 'seller'
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    res.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({ error: 'Failed to fetch sellers' });
  }
});

router.get('/students', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const students = await prisma.user.findMany({
      where: {
        isActive: true,
        id: { not: userId },
        roles: {
          some: {
            role: {
              name: 'student'
            }
          }
        }
      },
      include: {
        profile: true
      }
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;
