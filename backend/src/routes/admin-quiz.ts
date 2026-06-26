import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/admin/quiz/questions',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const questions = await prisma.quizQuestion.findMany({
        orderBy: { createdAt: 'asc' }
      });
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Failed to fetch questions' });
    }
  }
);

router.post('/admin/quiz/questions',
  authenticateToken,
  requireRole(['admin']),
  [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { question } = req.body;
      const quizQuestion = await prisma.quizQuestion.create({
        data: {
          question,
          options: [],
          isActive: true
        }
      });
      res.status(201).json(quizQuestion);
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({ error: 'Failed to create question' });
    }
  }
);

router.put('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { question } = req.body;
      const quizQuestion = await prisma.quizQuestion.update({
        where: { id: parseInt(id) },
        data: { question }
      });
      res.json(quizQuestion);
    } catch (error) {
      console.error('Error updating question:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }
);

router.delete('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isInt().withMessage('ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      await prisma.quizQuestion.delete({ where: { id: parseInt(id) } });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  }
);

router.get('/admin/quiz-responses/student/:studentId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('studentId').isInt().withMessage('Student ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentId } = req.params;

      const student = await prisma.user.findFirst({
        where: {
          id: parseInt(studentId),
          roles: {
            some: {
              role: {
                name: 'student'
              }
            }
          }
        },
        include: {
          profile: true,
          quizAnswers: {
            include: {
              question: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          receivedRecommendations: {
            include: {
              hobby: {
                include: {
                  category: true
                }
              },
              admin: {
                include: {
                  profile: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const formattedAnswers = student.quizAnswers.map(answer => ({
        id: answer.id,
        questionId: answer.questionId,
        questionText: answer.question?.question || 'Unknown Question',
        answerText: answer.answerText || 'No answer provided',
        createdAt: answer.createdAt
      }));

      const response = {
        id: student.id,
        email: student.email,
        profile: student.profile,
        quizAnswers: formattedAnswers,
        recommendations: student.receivedRecommendations,
        totalAnswers: formattedAnswers.length,
        totalRecommendations: student.receivedRecommendations.length,
        hasTakenQuiz: formattedAnswers.length > 0
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({ error: 'Failed to fetch student' });
    }
  }
);

router.get('/admin/quiz-responses',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const students = await prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: {
                name: 'student'
              }
            }
          }
        },
        include: {
          profile: true,
          quizAnswers: {
            include: {
              question: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          receivedRecommendations: true
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedStudents = students.map(student => {
        const hasQuizAnswers = student.quizAnswers && student.quizAnswers.length > 0;
        
        return {
          id: student.id,
          email: student.email,
          profile: student.profile,
          quizAnswers: student.quizAnswers.map(answer => ({
            id: answer.id,
            questionId: answer.questionId,
            questionText: answer.question?.question,
            answerText: answer.answerText,
            createdAt: answer.createdAt
          })),
          totalAnswers: student.quizAnswers.length,
          recommendationsCount: student.receivedRecommendations.length,
          hasTakenQuiz: hasQuizAnswers,
          lastActive: student.updatedAt
        };
      });

      res.json(formattedStudents);
    } catch (error) {
      console.error('Error fetching quiz responses:', error);
      res.status(500).json({ error: 'Failed to fetch quiz responses' });
    }
  }
);

router.post('/admin/quiz-responses/:studentId/recommend',
  authenticateToken,
  requireRole(['admin']),
  [
    param('studentId').isInt().withMessage('Student ID must be an integer'),
    body('hobbyId').isInt().withMessage('Hobby ID is required'),
    body('reason').optional().isString().trim().isLength({ max: 500 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { studentId } = req.params;
      const { hobbyId, reason } = req.body;
      const adminId = req.user.userId;

      const student = await prisma.user.findFirst({
        where: {
          id: parseInt(studentId),
          roles: {
            some: {
              role: {
                name: 'student'
              }
            }
          }
        }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const hobby = await prisma.hobby.findUnique({
        where: { id: hobbyId },
        include: { category: true }
      });

      if (!hobby) {
        return res.status(404).json({ error: 'Hobby not found' });
      }

      const recommendation = await prisma.studentRecommendation.create({
        data: {
          studentId: parseInt(studentId),
          adminId: adminId,
          hobbyId: hobbyId,
          reason: reason || null,
          isRead: false
        },
        include: {
          hobby: { include: { category: true } },
          admin: { include: { profile: true } }
        }
      });

      console.log('Recommendation created:', recommendation);

      res.status(201).json({
        message: 'Recommendation sent successfully',
        recommendation
      });
    } catch (error) {
      console.error('Error creating recommendation:', error);
      res.status(500).json({ error: 'Failed to create recommendation' });
    }
  }
);

router.get('/admin/hobbies-list',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const hobbies = await prisma.hobby.findMany({
        include: { category: true },
        orderBy: { name: 'asc' }
      });
      res.json(hobbies);
    } catch (error) {
      console.error('Error fetching hobbies:', error);
      res.status(500).json({ error: 'Failed to fetch hobbies' });
    }
  }
);

router.get('/admin/quiz-summary',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const totalStudents = await prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: 'student'
              }
            }
          }
        }
      });

      const studentsWithQuiz = await prisma.user.count({
        where: {
          roles: {
            some: {
              role: {
                name: 'student'
              }
            }
          },
          quizAnswers: {
            some: {}
          }
        }
      });

      const studentsWithoutQuiz = totalStudents - studentsWithQuiz;
      const totalRecommendations = await prisma.studentRecommendation.count();

      const summary = {
        totalStudents: totalStudents,
        studentsWithQuiz: studentsWithQuiz,
        studentsWithoutQuiz: studentsWithoutQuiz,
        totalRecommendations: totalRecommendations,
        averageQuizCompletion: totalStudents > 0 ? Math.round((studentsWithQuiz / totalStudents) * 100) : 0
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching quiz summary:', error);
      res.status(500).json({ error: 'Failed to fetch quiz summary' });
    }
  }
);

router.delete('/admin/recommendations/:recommendationId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('recommendationId').isInt().withMessage('Recommendation ID must be an integer')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { recommendationId } = req.params;
      await prisma.studentRecommendation.delete({
        where: { id: parseInt(recommendationId) }
      });
      res.json({ message: 'Recommendation deleted successfully' });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      res.status(500).json({ error: 'Failed to delete recommendation' });
    }
  }
);

export default router;
