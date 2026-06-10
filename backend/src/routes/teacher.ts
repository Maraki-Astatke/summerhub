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

// ============================================
// CERTIFICATE MANAGEMENT
// ============================================

// Create a certificate template
router.post('/teacher/certificates/template',
  authenticateToken,
  requireRole(['teacher']),
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('templateHtml').notEmpty(),
    body('hobbyId').optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, templateHtml, hobbyId } = req.body;
    const teacherId = req.user.userId;

    const template = await prisma.certificateTemplate.create({
      data: {
        title,
        description,
        templateHtml,
        hobbyId: hobbyId || null,
        teacherId
      }
    });

    res.status(201).json(template);
  }
);

// Get all certificate templates for a teacher
router.get('/teacher/certificates/templates',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const templates = await prisma.certificateTemplate.findMany({
      where: { teacherId },
      include: { hobby: true }
    });

    res.json(templates);
  }
);

// Get a single template
router.get('/teacher/certificates/template/:id',
  authenticateToken,
  requireRole(['teacher']),
  [param('id').isInt()],
  async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.userId;

    const template = await prisma.certificateTemplate.findFirst({
      where: { id: parseInt(id), teacherId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  }
);

// Delete a template
router.delete('/teacher/certificates/template/:id',
  authenticateToken,
  requireRole(['teacher']),
  [param('id').isInt()],
  async (req, res) => {
    const { id } = req.params;
    const teacherId = req.user.userId;

    const template = await prisma.certificateTemplate.findFirst({
      where: { id: parseInt(id), teacherId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await prisma.certificateTemplate.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Template deleted successfully' });
  }
);

// Get students who completed a hobby (interest level >= 4)
router.get('/teacher/students/completed/:hobbyId',
  authenticateToken,
  requireRole(['teacher']),
  [param('hobbyId').isInt()],
  async (req, res) => {
    const { hobbyId } = req.params;
    const teacherId = req.user.userId;

    const students = await prisma.user.findMany({
      where: {
        roles: { some: { role: { name: 'student' } } },
        userHobbies: {
          some: {
            hobbyId: parseInt(hobbyId),
            interestLevel: { gte: 4 }
          }
        }
      },
      include: {
        profile: true,
        userHobbies: {
          where: { hobbyId: parseInt(hobbyId) },
          include: { hobby: true }
        },
        certificates: {
          where: {
            template: {
              hobbyId: parseInt(hobbyId)
            }
          }
        }
      }
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      email: student.email,
      profile: student.profile,
      interestLevel: student.userHobbies[0]?.interestLevel || 0,
      hasCertificate: student.certificates.length > 0,
      certificateDate: student.certificates[0]?.issuedAt
    }));

    res.json(formattedStudents);
  }
);

// Issue a certificate to a student
router.post('/teacher/certificates/issue',
  authenticateToken,
  requireRole(['teacher']),
  [
    body('templateId').isInt(),
    body('studentId').isInt(),
    body('studentName').optional().trim(),
    body('customMessage').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, studentId, studentName, customMessage } = req.body;
    const teacherId = req.user.userId;

    const template = await prisma.certificateTemplate.findFirst({
      where: { id: templateId, teacherId }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        roles: { some: { role: { name: 'student' } } }
      },
      include: { profile: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        studentId,
        templateId
      }
    });

    if (existingCertificate) {
      return res.status(400).json({ error: 'Student already has this certificate' });
    }

    const displayName = studentName || `${student.profile?.firstName || ''} ${student.profile?.lastName || ''}`.trim() || student.email;

    let finalHtml = template.templateHtml
      .replace(/{{studentName}}/g, displayName)
      .replace(/{{date}}/g, new Date().toLocaleDateString())
      .replace(/{{certificateTitle}}/g, template.title);

    if (customMessage) {
      finalHtml = finalHtml.replace(/{{message}}/g, customMessage);
    }

    const certificate = await prisma.certificate.create({
      data: {
        studentId,
        templateId,
        issuedAt: new Date(),
        certificateHtml: finalHtml,
        customMessage: customMessage || null
      },
      include: {
        template: {
          include: { hobby: true }
        }
      }
    });

    res.status(201).json(certificate);
  }
);

// Get certificates issued by teacher
router.get('/teacher/certificates/issued',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    const teacherId = req.user.userId;

    const certificates = await prisma.certificate.findMany({
      where: {
        template: { teacherId }
      },
      include: {
        student: {
          include: { profile: true }
        },
        template: {
          include: { hobby: true }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(certificates);
  }
);

// Get certificates for a student (for dashboard)
router.get('/students/certificates',
  authenticateToken,
  requireRole(['student']),
  async (req, res) => {
    const studentId = req.user.userId;

    const certificates = await prisma.certificate.findMany({
      where: { studentId },
      include: {
        template: {
          include: { hobby: true, teacher: { include: { profile: true } } }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });

    res.json(certificates);
  }
);

// Download certificate (get HTML)
router.get('/certificates/:id/download',
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const certificate = await prisma.certificate.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { studentId: userId },
          { template: { teacherId: userId } }
        ]
      },
      include: {
        student: { include: { profile: true } },
        template: { include: { teacher: { include: { profile: true } } } }
      }
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(certificate.certificateHtml);
  }
);

export default router;