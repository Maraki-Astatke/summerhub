import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

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

router.get('/categories', async (req, res) => {
  const categories = await prisma.hobbyCategory.findMany({
    include: {
      hobbies: true
    }
  });
  
  res.json(categories);
});

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