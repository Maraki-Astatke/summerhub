import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard/stats',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const [quizResult, registeredLessons, userHobbies, blogPosts, orderCount] = await Promise.all([
      prisma.quizResult.findFirst({
        where: { userId }
      }),
      prisma.lessonRegistration.count({
        where: { studentId: userId }
      }),
      prisma.userHobby.count({
        where: { userId }
      }),
      prisma.blogPost.count({
        where: { authorId: userId }
      }),
      prisma.order.count({
        where: { userId }
      })
    ]);

    res.json({
      hasTakenQuiz: !!quizResult,
      registeredLessons,
      hobbiesDiscovered: userHobbies,
      blogPostsWritten: blogPosts,
      ordersPlaced: orderCount
    });
  }
);

router.get('/dashboard/progress',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const quizResult = await prisma.quizResult.findFirst({
      where: { userId },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    const attendedLessons = await prisma.lessonRegistration.count({
      where: {
        studentId: userId,
        attended: true
      }
    });

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId },
      include: {
        hobby: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        interestLevel: 'desc'
      }
    });

    res.json({
      quizCompleted: !!quizResult,
      quizCompletedAt: quizResult?.completedAt,
      attendedLessons,
      topHobbies: userHobbies.slice(0, 3),
      allHobbies: userHobbies
    });
  }
);

router.get('/dashboard/certificates',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const attendedLessons = await prisma.lessonRegistration.findMany({
      where: {
        studentId: userId,
        attended: true
      },
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

    const certificates = attendedLessons.map(reg => ({
      id: reg.id,
      title: reg.lesson.title,
      hobby: reg.lesson.hobby.name,
      teacher: `${reg.lesson.teacher.profile?.firstName} ${reg.lesson.teacher.profile?.lastName}`,
      completedAt: reg.registeredAt,
      certificateUrl: `/certificates/${reg.id}`
    }));

    res.json(certificates);
  }
);

router.get('/dashboard/achievements',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const [quizResult, attendedCount, blogCount, orderCount, hobbyCount] = await Promise.all([
      prisma.quizResult.findFirst({ where: { userId } }),
      prisma.lessonRegistration.count({ where: { studentId: userId, attended: true } }),
      prisma.blogPost.count({ where: { authorId: userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.userHobby.count({ where: { userId } })
    ]);

    const achievements = [];

    if (quizResult) {
      achievements.push({ name: 'Quiz Master', description: 'Completed the interest quiz', earned: true });
    }

    if (attendedCount >= 1) {
      achievements.push({ name: 'First Lesson', description: 'Attended first lesson', earned: true });
    }

    if (attendedCount >= 5) {
      achievements.push({ name: 'Dedicated Learner', description: 'Attended 5 lessons', earned: true });
    }

    if (hobbyCount >= 3) {
      achievements.push({ name: 'Hobby Explorer', description: 'Discovered 3 hobbies', earned: true });
    }

    if (blogCount >= 1) {
      achievements.push({ name: 'First Blog', description: 'Published first blog post', earned: true });
    }

    if (orderCount >= 1) {
      achievements.push({ name: 'First Purchase', description: 'Made first marketplace purchase', earned: true });
    }

    res.json(achievements);
  }
);

router.put('/profile',
  authenticateToken,
  async (req, res) => {
    const userId = req.user.userId;
    const { firstName, lastName, age, grade, city, schoolName, avatarUrl, bio } = req.body;

    const profile = await prisma.profile.update({
      where: { userId },
      data: {
        firstName,
        lastName,
        age,
        grade,
        city,
        schoolName,
        avatarUrl,
        bio
      }
    });

    res.json(profile);
  }
);

router.get('/profile',
  authenticateToken,
  async (req, res) => {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  }
);

export default router;