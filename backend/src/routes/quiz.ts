import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

const quizSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many quiz submissions. Try again in 1 hour.' }
});

router.post('/admin/quiz/questions',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question } = req.body;

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        options: [],
        isActive: true
      }
    });

    res.status(201).json(quizQuestion);
  }
);

router.put('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { question } = req.body;

    const quizQuestion = await prisma.quizQuestion.update({
      where: { id: parseInt(id) },
      data: {
        question
      }
    });

    res.json(quizQuestion);
  }
);

router.delete('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin', 'teacher']),
  async (req, res) => {
    const { id } = req.params;

    await prisma.quizQuestion.delete({
      where: { id: parseInt(id) }
    });

    res.status(204).send();
  }
);

router.get('/quiz/questions',
  async (req, res) => {
    const questions = await prisma.quizQuestion.findMany({
      where: { isActive: true },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question
    }));

    res.json(sanitizedQuestions);
  }
);

router.post('/quiz/submit',
  authenticateToken,
  requireRole(['student']),
  quizSubmitLimiter,
  [
    body('answers').isArray({ min: 1 }),
    body('answers.*.questionId').isInt(),
    body('answers.*.answer').isString().trim().isLength({ min: 1, max: 2000 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers } = req.body;
    const studentId = req.user.userId;

    const existingResult = await prisma.quizResult.findFirst({
      where: { userId: studentId }
    });

    if (existingResult) {
      return res.status(400).json({ error: 'You have already taken the quiz' });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        for (const answer of answers) {
          const question = await tx.quizQuestion.findUnique({
            where: { id: answer.questionId }
          });

          if (!question) {
            throw new Error(`Question ${answer.questionId} not found`);
          }

          await tx.quizAnswer.create({
            data: {
              studentId: studentId,
              questionId: answer.questionId,
              selectedHobbyId: 0,
              answerText: answer.answer
            }
          });
        }

        return await tx.quizResult.create({
          data: {
            userId: studentId,
            answers: answers,
            topHobbyIds: [],
            completedAt: new Date()
          }
        });
      });

      res.status(201).json({
        message: 'Quiz submitted successfully',
        result: {
          id: result.id,
          completedAt: result.completedAt
        }
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({ error: error.message || 'Failed to submit quiz' });
    }
  }
);

router.get('/quiz/results',
  authenticateToken,
  requireRole(['student']),
  async (req, res) => {
    const studentId = req.user.userId;

    const result = await prisma.quizResult.findFirst({
      where: { userId: studentId }
    });

    if (!result) {
      return res.status(404).json({ error: 'No quiz results found' });
    }

    res.json({
      completedAt: result.completedAt,
      quizCompleted: true
    });
  }
);

router.get('/quiz/recommendations',
  authenticateToken,
  requireRole(['student']),
  async (req, res) => {
    const studentId = req.user.userId;

    const recommendations = await prisma.studentRecommendation.findMany({
      where: { 
        studentId: studentId
      },
      include: {
        hobby: {
          include: { category: true }
        },
        admin: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(recommendations);
  }
);

router.get('/quiz/progress',
  authenticateToken,
  requireRole(['student']),
  async (req, res) => {
    const studentId = req.user.userId;

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId: studentId },
      include: {
        hobby: {
          include: {
            category: true,
            lessons: {
              where: {
                dateTime: {
                  gt: new Date()
                }
              },
              take: 3
            }
          }
        }
      },
      orderBy: {
        interestLevel: 'desc'
      }
    });

    res.json(userHobbies);
  }
);

export default router;
