import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/teacher/stats',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const [totalLessons, totalStudents, upcomingLessons, totalRevenue] = await Promise.all([
      prisma.lesson.count({ where: { teacherId } }),
      prisma.lessonRegistration.count({
        where: { lesson: { teacherId } }
      }),
      prisma.lesson.count({
        where: {
          teacherId,
          dateTime: { gt: new Date() }
        }
      }),
      prisma.orderItem.aggregate({
        where: {
          product: {
            sellerId: teacherId
          },
          order: {
            status: 'paid'
          }
        },
        _sum: {
          priceAtTime: true
        }
      })
    ]);

    res.json({
      totalLessons,
      totalStudents,
      upcomingLessons,
      totalRevenue: totalRevenue._sum.priceAtTime || 0
    });
  }
);

router.post('/teacher/lessons/create',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [
    body('title').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('hobbyId').isInt(),
    body('dateTime').isISO8601(),
    body('durationMinutes').isInt({ min: 15, max: 180 }),
    body('maxStudents').isInt({ min: 1, max: 100 }),
    body('zoomLink').optional().isURL().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, hobbyId, dateTime, durationMinutes, maxStudents, zoomLink } = req.body;
    const teacherId = req.user.userId;

    const hobby = await prisma.hobby.findUnique({
      where: { id: hobbyId }
    });

    if (!hobby) {
      return res.status(400).json({ error: 'Hobby not found' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        teacherId,
        hobbyId,
        dateTime: new Date(dateTime),
        durationMinutes,
        maxStudents,
        zoomLink
      },
      include: {
        teacher: {
          include: {
            profile: true
          }
        },
        hobby: true
      }
    });

    res.status(201).json(lesson);
  }
);

router.get('/teacher/lessons',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const lessons = await prisma.lesson.findMany({
      where: { teacherId },
      include: {
        hobby: true,
        registrations: {
          include: {
            student: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: { dateTime: 'desc' }
    });

    res.json(lessons);
  }
);

router.get('/teacher/students',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const students = await prisma.lessonRegistration.findMany({
      where: {
        lesson: { teacherId }
      },
      include: {
        student: {
          include: {
            profile: true,
            userHobbies: {
              include: {
                hobby: true
              }
            }
          }
        },
        lesson: true
      },
      distinct: ['studentId']
    });

    const uniqueStudents = students.map(s => ({
      id: s.student.id,
      email: s.student.email,
      profile: s.student.profile,
      hobbies: s.student.userHobbies.map(h => h.hobby.name),
      registeredLessons: s.student.lessonRegistrations?.length || 0
    }));

    res.json(uniqueStudents);
  }
);

router.get('/teacher/students/:studentId',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [param('studentId').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { studentId } = req.params;
    const teacherId = req.user.userId;

    const student = await prisma.user.findFirst({
      where: {
        id: parseInt(studentId),
        lessonRegistrations: {
          some: {
            lesson: { teacherId }
          }
        }
      },
      include: {
        profile: true,
        userHobbies: {
          include: {
            hobby: true
          }
        },
        lessonRegistrations: {
          where: {
            lesson: { teacherId }
          },
          include: {
            lesson: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  }
);

router.get('/teacher/lessons/upcoming',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const lessons = await prisma.lesson.findMany({
      where: {
        teacherId,
        dateTime: { gt: new Date() }
      },
      include: {
        hobby: true,
        registrations: {
          include: {
            student: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });

    res.json(lessons);
  }
);

router.post('/teacher/lessons/:id/cancel',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const teacherId = req.user.userId;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: parseInt(id),
        teacherId
      }
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: parseInt(id) },
      data: { dateTime: new Date(0) }
    });

    res.json({ message: 'Lesson cancelled', lesson: updatedLesson });
  }
);

router.get('/teacher/revenue',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: teacherId
        },
        order: {
          status: 'paid'
        }
      },
      include: {
        product: true,
        order: true
      },
      orderBy: {
        order: {
          createdAt: 'desc'
        }
      }
    });

    const totalRevenue = orderItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

    const monthlyRevenue = new Map();

    for (const item of orderItems) {
      const month = item.order.createdAt.toISOString().slice(0, 7);
      const amount = item.priceAtTime * item.quantity;
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + amount);
    }

    res.json({
      totalRevenue,
      monthlyRevenue: Array.from(monthlyRevenue.entries()).map(([month, amount]) => ({ month, amount })),
      recentSales: orderItems.slice(0, 20)
    });
  }
);

export default router;