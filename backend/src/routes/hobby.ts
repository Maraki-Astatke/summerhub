import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get all hobbies
router.get('/hobbies', async (req, res) => {
  const { categoryId, ageGroup, search, page = '1', limit = '20' } = req.query;
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  const where: any = {};
  
  if (categoryId) {
    where.categoryId = parseInt(categoryId as string);
  }
  
  if (ageGroup) {
    where.ageGroup = ageGroup as string;
  }
  
  if (search) {
    where.name = {
      contains: search as string,
      mode: 'insensitive'
    };
  }
  
  const [hobbies, total] = await Promise.all([
    prisma.hobby.findMany({
      where,
      include: {
        category: true
      },
      skip,
      take: limitNum,
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.hobby.count({ where })
  ]);
  
  res.json({
    data: hobbies,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// Get single hobby
router.get('/hobbies/:id', async (req, res) => {
  const { id } = req.params;
  
  const hobby = await prisma.hobby.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: true,
      lessons: {
        where: {
          dateTime: {
            gt: new Date()
          }
        },
        orderBy: {
          dateTime: 'asc'
        },
        take: 5
      }
    }
  });
  
  if (!hobby) {
    return res.status(404).json({ error: 'Hobby not found' });
  }
  
  res.json(hobby);
});

// Check if student is registered for a hobby
router.get('/hobbies/:id/is-registered', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    const isStudent = user?.roles?.some(r => r.role.name === 'student');
    
    if (!isStudent) {
      return res.json({ isRegistered: false });
    }
    
    // Check if user is registered for this hobby
    const registration = await prisma.userHobby.findUnique({
      where: {
        userId_hobbyId: {
          userId: userId,
          hobbyId: parseInt(id)
        }
      }
    });
    
    res.json({ isRegistered: !!registration });
  } catch (error) {
    console.error('Error checking registration:', error);
    res.status(500).json({ error: 'Failed to check registration' });
  }
});

// Register student for a hobby
router.post('/hobbies/:id/register', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    const isStudent = user?.roles?.some(r => r.role.name === 'student');
    
    if (!isStudent) {
      return res.status(403).json({ error: 'Only students can register for hobbies' });
    }
    
    // Check if hobby exists
    const hobby = await prisma.hobby.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!hobby) {
      return res.status(404).json({ error: 'Hobby not found' });
    }
    
    // Check if already registered
    const existingRegistration = await prisma.userHobby.findUnique({
      where: {
        userId_hobbyId: {
          userId: userId,
          hobbyId: parseInt(id)
        }
      }
    });
    
    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this hobby' });
    }
    
    // Create registration
    const registration = await prisma.userHobby.create({
      data: {
        userId: userId,
        hobbyId: parseInt(id),
        interestLevel: 1 // Start with interest level 1
      }
    });
    
    res.status(201).json({ 
      message: 'Successfully registered for hobby',
      registration 
    });
  } catch (error) {
    console.error('Error registering for hobby:', error);
    res.status(500).json({ error: 'Failed to register for hobby' });
  }
});

// Unregister student from a hobby
router.delete('/hobbies/:id/unregister', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    const isStudent = user?.roles?.some(r => r.role.name === 'student');
    
    if (!isStudent) {
      return res.status(403).json({ error: 'Only students can unregister from hobbies' });
    }
    
    // Check if hobby exists
    const hobby = await prisma.hobby.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!hobby) {
      return res.status(404).json({ error: 'Hobby not found' });
    }
    
    // Check if registered
    const registration = await prisma.userHobby.findUnique({
      where: {
        userId_hobbyId: {
          userId: userId,
          hobbyId: parseInt(id)
        }
      }
    });
    
    if (!registration) {
      return res.status(404).json({ error: 'Not registered for this hobby' });
    }
    
    // Find all lessons for this hobby
    const lessons = await prisma.lesson.findMany({
      where: { hobbyId: parseInt(id) },
      select: { id: true }
    });
    
    const lessonIds = lessons.map(l => l.id);
    
    // Delete all lesson registrations for this hobby
    if (lessonIds.length > 0) {
      await prisma.lessonRegistration.deleteMany({
        where: {
          userId: userId,
          lessonId: { in: lessonIds }
        }
      });
    }
    
    // Delete the hobby registration
    await prisma.userHobby.delete({
      where: {
        userId_hobbyId: {
          userId: userId,
          hobbyId: parseInt(id)
        }
      }
    });
    
    res.json({ message: 'Successfully unregistered from hobby' });
  } catch (error) {
    console.error('Error unregistering from hobby:', error);
    res.status(500).json({ error: 'Failed to unregister from hobby' });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  const categories = await prisma.hobbyCategory.findMany({
    include: {
      hobbies: true
    }
  });
  
  res.json(categories);
});

// Get hobbies by category
router.get('/categories/:categoryId/hobbies', async (req, res) => {
  const { categoryId } = req.params;
  
  const category = await prisma.hobbyCategory.findUnique({
    where: { id: parseInt(categoryId) },
    include: {
      hobbies: true
    }
  });
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  
  res.json(category);
});

export default router;