import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
export const getHobbies = async (req: any, res: any) => {
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
};
export const getHobbiesId = async (req: any, res: any) => {
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
};
export const getHobbiesIdIsregistered = async (req: any, res: any) => {
try {
const { id } = req.params;
const userId = req.user.userId;

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
};
export const postHobbiesIdRegister = async (req: any, res: any) => {
try {
const { id } = req.params;
const userId = req.user.userId;

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

const hobby = await prisma.hobby.findUnique({
  where: { id: parseInt(id) }
});

if (!hobby) {
  return res.status(404).json({ error: 'Hobby not found' });
}

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

const registration = await prisma.userHobby.create({
  data: {
    userId: userId,
    hobbyId: parseInt(id),
    interestLevel: 1
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
};
export const deleteHobbiesIdUnregister = async (req: any, res: any) => {
try {
const { id } = req.params;
const userId = req.user.userId;

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

const hobby = await prisma.hobby.findUnique({
  where: { id: parseInt(id) }
});

if (!hobby) {
  return res.status(404).json({ error: 'Hobby not found' });
}

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

const lessons = await prisma.lesson.findMany({
  where: { hobbyId: parseInt(id) },
  select: { id: true }
});

const lessonIds = lessons.map(l => l.id);

if (lessonIds.length > 0) {
  await prisma.lessonRegistration.deleteMany({
    where: {
      userId: userId,
      lessonId: { in: lessonIds }
    }
  });
}

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
};
export const getCategories = async (req: any, res: any) => {
const categories = await prisma.hobbyCategory.findMany({
include: {
  hobbies: true
}
});

res.json(categories);
};
export const getCategoriesCategoryIdHobbies = async (req: any, res: any) => {
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
};
