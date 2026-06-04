import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/parent/children/link',
  authenticateToken,
  requireRole(['parent']),
  [
    body('childEmail').isEmail().normalizeEmail(),
    body('childPhone').optional().matches(/^(09|07)[0-9]{8}$/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { childEmail, childPhone } = req.body;
    const parentId = req.user.userId;

    const child = await prisma.user.findFirst({
      where: {
        OR: [
          { email: childEmail },
          { phone: childPhone }
        ]
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const isStudent = child.roles.some(r => r.role.name === 'student');
    if (!isStudent) {
      return res.status(400).json({ error: 'User is not a student' });
    }

    const existingLink = await prisma.userRole.findFirst({
      where: {
        userId: child.id,
        role: {
          name: 'parent'
        }
      }
    });

    if (existingLink) {
      return res.status(400).json({ error: 'Child already linked to a parent' });
    }

    const parentRole = await prisma.role.findUnique({
      where: { name: 'parent' }
    });

    const userRole = await prisma.userRole.create({
      data: {
        userId: child.id,
        roleId: parentRole.id,
        assignedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Child linked successfully', childId: child.id });
  }
);

router.get('/parent/children',
  authenticateToken,
  requireRole(['parent']),
  async (req, res) => {
    const parentId = req.user.userId;

    const children = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'student'
            },
            user: {
              roles: {
                some: {
                  userId: parentId,
                  role: {
                    name: 'parent'
                  }
                }
              }
            }
          }
        }
      },
      include: {
        profile: true,
        quizResults: true,
        userHobbies: {
          include: {
            hobby: true
          }
        },
        lessonRegistrations: {
          include: {
            lesson: true
          }
        }
      }
    });

    res.json(children);
  }
);

router.get('/parent/child/:id/progress',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const parentId = req.user.userId;

    const child = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        roles: {
          some: {
            role: { name: 'student' }
          }
        }
      },
      include: {
        profile: true
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId: child.id }
    });

    const lessonRegistrations = await prisma.lessonRegistration.findMany({
      where: { studentId: child.id },
      include: {
        lesson: {
          include: {
            hobby: true,
            teacher: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId: child.id },
      include: {
        hobby: true
      }
    });

    const blogPosts = await prisma.blogPost.count({
      where: { authorId: child.id }
    });

    const orders = await prisma.order.count({
      where: { userId: child.id }
    });

    res.json({
      child: {
        id: child.id,
        email: child.email,
        phone: child.phone,
        profile: child.profile
      },
      progress: {
        quizCompleted: !!quizResult,
        totalLessonsRegistered: lessonRegistrations.length,
        lessonsAttended: lessonRegistrations.filter(l => l.attended).length,
        hobbiesDiscovered: userHobbies.length,
        blogPostsWritten: blogPosts,
        ordersPlaced: orders
      },
      recentLessons: lessonRegistrations.slice(-5),
      topHobbies: userHobbies.sort((a, b) => b.interestLevel - a.interestLevel).slice(0, 3)
    });
  }
);

router.get('/parent/child/:id/lessons',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const registrations = await prisma.lessonRegistration.findMany({
      where: { studentId: parseInt(id) },
      include: {
        lesson: {
          include: {
            hobby: true,
            teacher: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        lesson: {
          dateTime: 'desc'
        }
      }
    });

    res.json(registrations);
  }
);

router.post('/parent/child/:id/approve-purchase',
  authenticateToken,
  requireRole(['parent']),
  [
    param('id').isInt(),
    body('orderId').isInt(),
    body('approved').isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, orderId, approved } = req.body;
    const parentId = req.user.userId;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: parseInt(id)
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: approved ? 'approved_by_parent' : 'rejected_by_parent'
      }
    });

    res.json(updatedOrder);
  }
);

router.get('/parent/child/:id/quiz-results',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId: parseInt(id) }
    });

    if (!quizResult) {
      return res.status(404).json({ error: 'No quiz results found' });
    }

    const recommendedHobbies = await prisma.hobby.findMany({
      where: {
        id: { in: quizResult.topHobbyIds }
      },
      include: {
        category: true
      }
    });

    res.json({
      completedAt: quizResult.completedAt,
      recommendations: recommendedHobbies
    });
  }
);

export default router;