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
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape(),
    body('options').isArray({ min: 2, max: 6 }),
    body('options.*.text').notEmpty().trim().escape(),
    body('options.*.hobbyId').isInt(),
    body('hobbyId').optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, options, hobbyId } = req.body;

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        question,
        options,
        hobbyId
      }
    });

    res.status(201).json(quizQuestion);
  }
);

router.get('/quiz/questions',
  async (req, res) => {
    const questions = await prisma.quizQuestion.findMany({
      include: {
        hobby: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      hobbyId: q.hobbyId
    }));

    res.json(sanitizedQuestions);
  }
);

router.post('/quiz/submit',
  authenticateToken,
  requireRole(['student', 'scholar']),
  quizSubmitLimiter,
  [
    body('answers').isArray({ min: 1 }),
    body('answers.*.questionId').isInt(),
    body('answers.*.selectedHobbyId').isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answers } = req.body;
    const userId = req.user.userId;

    const existingResult = await prisma.quizResult.findFirst({
      where: { userId }
    });

    if (existingResult) {
      return res.status(400).json({ error: 'You have already taken the quiz' });
    }

    const hobbyScores = new Map();

    for (const answer of answers) {
      const question = await prisma.quizQuestion.findUnique({
        where: { id: answer.questionId }
      });

      if (!question) {
        return res.status(400).json({ error: `Question ${answer.questionId} not found` });
      }

      const validOption = question.options.find(
        (opt: any) => opt.hobbyId === answer.selectedHobbyId
      );

      if (!validOption) {
        return res.status(400).json({ error: `Invalid option for question ${answer.questionId}` });
      }

      const currentScore = hobbyScores.get(answer.selectedHobbyId) || 0;
      hobbyScores.set(answer.selectedHobbyId, currentScore + 1);
    }

    const sortedHobbies = Array.from(hobbyScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const result = await prisma.quizResult.create({
      data: {
        userId,
        answers,
        topHobbyIds: sortedHobbies.map(h => h[0]),
        completedAt: new Date()
      }
    });

    for (const [hobbyId, score] of sortedHobbies) {
      await prisma.userHobby.upsert({
        where: {
          userId_hobbyId: {
            userId,
            hobbyId: parseInt(hobbyId)
          }
        },
        update: {
          interestLevel: score
        },
        create: {
          userId,
          hobbyId: parseInt(hobbyId),
          interestLevel: score
        }
      });
    }

    const recommendedHobbies = await prisma.hobby.findMany({
      where: {
        id: {
          in: sortedHobbies.map(h => parseInt(h[0]))
        }
      },
      include: {
        category: true
      }
    });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      recommendations: recommendedHobbies,
      scores: sortedHobbies.map(([id, score]) => ({
        hobbyId: parseInt(id),
        score
      }))
    });
  }
);

router.get('/quiz/results',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const result = await prisma.quizResult.findFirst({
      where: { userId }
    });

    if (!result) {
      return res.status(404).json({ error: 'No quiz results found' });
    }

    const recommendedHobbies = await prisma.hobby.findMany({
      where: {
        id: {
          in: result.topHobbyIds
        }
      },
      include: {
        category: true
      }
    });

    res.json({
      completedAt: result.completedAt,
      recommendations: recommendedHobbies
    });
  }
);

router.get('/quiz/recommendations',
  authenticateToken,
  requireRole(['student', 'scholar']),
  async (req, res) => {
    const userId = req.user.userId;

    const userHobbies = await prisma.userHobby.findMany({
      where: { userId },
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