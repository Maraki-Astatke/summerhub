import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use('/admin', (req, res, next) => authenticateToken(req as any, res, next));
router.use('/admin', (req, res, next) => requireRole(['admin'])(req as any, res, next));

router.get('/admin/stats', async (req, res) => {
  const [totalUsers, totalStudents, totalTeachers, totalSellers, totalProducts, totalLessons, totalOrders, totalRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { roles: { some: { role: { name: 'student' } } } }
    }),
    prisma.user.count({
      where: { roles: { some: { role: { name: 'teacher' } } } }
    }),
    prisma.user.count({
      where: { roles: { some: { role: { name: 'seller' } } } }
    }),
    prisma.product.count(),
    prisma.lesson.count(),
    prisma.order.count(),
    prisma.orderItem.aggregate({
      where: { order: { status: 'paid' } },
      _sum: { priceAtTime: true }
    })
  ]);

  res.json({
    totalUsers,
    totalStudents,
    totalTeachers,
    totalSellers,
    totalProducts,
    totalLessons,
    totalOrders,
    totalRevenue: totalRevenue._sum.priceAtTime || 0
  });
});

router.get('/admin/users', async (req, res) => {
  const { role, isVerified, page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};

  if (role) {
    where.roles = { some: { role: { name: role as string } } };
  }

  if (isVerified === 'true') {
    where.isVerified = true;
  } else if (isVerified === 'false') {
    where.isVerified = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        }
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  const usersWithoutPassword = users.map(({ password, ...user }) => user);

  res.json({
    data: usersWithoutPassword,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

router.get('/admin/users/:id',
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        },
        userHobbies: {
          include: {
            hobby: true
          }
        },
        lessonRegistrations: {
          include: {
            lesson: true
          }
        },
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  }
);

router.put('/admin/users/:id/roles',
  [param('id').isInt(), body('roleIds').isArray()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { roleIds } = req.body;

    await prisma.userRole.deleteMany({
      where: { userId: parseInt(id) }
    });

    const userRoles = roleIds.map((roleId: number) => ({
      userId: parseInt(id),
      roleId,
      assignedAt: new Date()
    }));

    await prisma.userRole.createMany({
      data: userRoles
    });

    res.json({ message: 'User roles updated' });
  }
);

router.put('/admin/users/:id/activate',
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });

    res.json({ message: 'User activated', user: { id: user.id, email: user.email, isActive: user.isActive } });
  }
);

router.put('/admin/users/:id/deactivate',
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({ message: 'User deactivated', user: { id: user.id, email: user.email, isActive: user.isActive } });
  }
);

router.delete('/admin/users/:id',
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  }
);

router.get('/admin/reports/sales', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: 'paid' },
    include: {
      user: {
        include: {
          profile: true
        }
      },
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  res.json({
    totalSales,
    orderCount: orders.length,
    orders
  });
});

router.get('/admin/reports/lessons', async (req, res) => {
  const lessons = await prisma.lesson.findMany({
    include: {
      teacher: {
        include: {
          profile: true
        }
      },
      hobby: true,
      registrations: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const totalRegistrations = lessons.reduce((sum, lesson) => sum + lesson.registrations.length, 0);

  res.json({
    totalLessons: lessons.length,
    totalRegistrations,
    lessons
  });
});

router.get('/admin/reports/scholarships', async (req, res) => {
  const scholarships = await prisma.scholarship.findMany({
    include: {
      applications: {
        include: {
          user: {
            include: {
              profile: true
            }
          }
        }
      }
    }
  });

  const totalApplications = scholarships.reduce((sum, s) => sum + s.applications.length, 0);
  const approvedApplications = scholarships.reduce((sum, s) => sum + s.applications.filter(a => a.status === 'approved').length, 0);

  res.json({
    totalScholarships: scholarships.length,
    totalApplications,
    approvedApplications,
    scholarships
  });
});

router.post('/admin/categories', async (req, res) => {
  const { name, description } = req.body;
  
  const category = await prisma.hobbyCategory.create({
    data: { name, description }
  });
  
  res.status(201).json(category);
});

router.get('/admin/categories', async (req, res) => {
  const categories = await prisma.hobbyCategory.findMany({
    include: { hobbies: true }
  });
  res.json(categories);
});

router.put('/admin/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const category = await prisma.hobbyCategory.update({
    where: { id: parseInt(id) },
    data: { name, description }
  });
  res.json(category);
});

router.delete('/admin/categories/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.hobbyCategory.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
});

router.post('/admin/hobbies', async (req, res) => {
  const { name, description, ageGroup, categoryId, imageUrl } = req.body;
  
  const hobby = await prisma.hobby.create({
    data: { name, description, ageGroup, categoryId, imageUrl }
  });
  res.status(201).json(hobby);
});

router.put('/admin/hobbies/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, ageGroup, categoryId, imageUrl } = req.body;
  
  const hobby = await prisma.hobby.update({
    where: { id: parseInt(id) },
    data: { name, description, ageGroup, categoryId, imageUrl }
  });
  res.json(hobby);
});

router.delete('/admin/hobbies/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.hobby.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
});

router.post('/admin/product-categories', async (req, res) => {
  const { name, description } = req.body;
  
  const category = await prisma.productCategory.create({
    data: { name, description }
  });
  
  res.status(201).json(category);
});

router.get('/admin/product-categories', async (req, res) => {
  const categories = await prisma.productCategory.findMany();
  res.json(categories);
});

router.put('/admin/product-categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  const category = await prisma.productCategory.update({
    where: { id: parseInt(id) },
    data: { name, description }
  });
  res.json(category);
});

router.delete('/admin/product-categories/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.productCategory.delete({ where: { id: parseInt(id) } });
  res.status(204).send();
});

export default router;
