import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Link a child to parent
router.post('/parent/children/link',
  authenticateToken,
  requireRole(['parent']),
  [
    body('childEmail').optional().isEmail().normalizeEmail(), // ✅ FIX: Made optional
    body('childPhone').optional().matches(/^(09|07)[0-9]{8}$/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { childEmail, childPhone } = req.body;
    const parentId = req.user.userId;

    // ✅ FIX: Validate at least one is provided
    if (!childEmail && !childPhone) {
      return res.status(400).json({ error: 'Please provide either email or phone number' });
    }

    const child = await prisma.user.findFirst({
      where: {
        OR: [
          ...(childEmail ? [{ email: childEmail }] : []),
          ...(childPhone ? [{ phone: childPhone }] : [])
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

    // Check if user is a student
    const isStudent = child.roles.some(r => r.role.name === 'student');
    if (!isStudent) {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // ✅ FIX: Check if child is already linked to this parent
    const existingLink = await prisma.userRole.findFirst({
      where: {
        userId: child.id,
        roleId: 5  // parent role ID - the parent role means "linked to a parent"
      }
    });

    if (existingLink) {
      return res.status(400).json({ error: 'Child already linked to a parent' });
    }

    // ✅ FIX: Create the link by adding parent role to the child
    await prisma.userRole.create({
      data: {
        userId: child.id,
        roleId: 5,  // parent role ID - indicates child is linked to a parent
        assignedAt: new Date()
      }
    });

    res.status(201).json({ 
      message: 'Child linked successfully', 
      childId: child.id,
      childName: child.profile?.firstName || 'Student'
    });
  }
);

// Get all children for this parent
router.get('/parent/children',
  authenticateToken,
  requireRole(['parent']),
  async (req, res) => {
    const parentId = req.user.userId;

    // Find all users who have the parent role (meaning they are linked to this parent)
    const children = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            roleId: 5  // parent role means they are linked as child
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

    // Filter out the parent themselves
    const filteredChildren = children.filter(child => child.id !== parentId);
    
    console.log(`Parent ${parentId} has ${filteredChildren.length} children`);
    res.json(filteredChildren);
  }
);

// Get child progress
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
    const childId = parseInt(id);

    const child = await prisma.user.findUnique({
      where: { id: childId },
      include: { profile: true }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId: childId }
    });

    const lessonRegistrations = await prisma.lessonRegistration.findMany({
      where: { studentId: childId },
      include: {
        lesson: {
          include: {
            hobby: true,
            teacher: {
              include: { profile: true }
            }
          }
        }
      }
    });

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId: childId },
      include: { hobby: true }
    });

    const blogPosts = await prisma.blogPost.count({
      where: { authorId: childId }
    });

    const orders = await prisma.order.count({
      where: { userId: childId }
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

// Get child lessons
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
              include: { profile: true }
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

// Get child quiz results
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
      include: { category: true }
    });

    res.json({
      completedAt: quizResult.completedAt,
      recommendations: recommendedHobbies
    });
  }
);

// Approve purchase
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

export default router;