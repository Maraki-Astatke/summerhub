import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getAdminQuizQuestions, postAdminQuizQuestions, putAdminQuizQuestionsId, deleteAdminQuizQuestionsId, getAdminQuizresponsesStudentStudentId, getAdminQuizresponses, postAdminQuizresponsesStudentIdRecommend, getAdminHobbieslist, getAdminQuizsummary, deleteAdminRecommendationsRecommendationId } from "../controllers/admin-quizController.js";

const router = Router();

router.get('/admin/quiz/questions',
  authenticateToken,
  requireRole(['admin']), getAdminQuizQuestions
);

router.post('/admin/quiz/questions',
  authenticateToken,
  requireRole(['admin']),
  [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ], postAdminQuizQuestions
);

router.put('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
  ], putAdminQuizQuestionsId
);

router.delete('/admin/quiz/questions/:id',
  authenticateToken,
  requireRole(['admin']),
  [
    param('id').isInt().withMessage('ID must be an integer')
  ], deleteAdminQuizQuestionsId
);

router.get('/admin/quiz-responses/student/:studentId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('studentId').isInt().withMessage('Student ID must be an integer')
  ], getAdminQuizresponsesStudentStudentId
);

router.get('/admin/quiz-responses',
  authenticateToken,
  requireRole(['admin']), getAdminQuizresponses
);

router.post('/admin/quiz-responses/:studentId/recommend',
  authenticateToken,
  requireRole(['admin']),
  [
    param('studentId').isInt().withMessage('Student ID must be an integer'),
    body('hobbyId').isInt().withMessage('Hobby ID is required'),
    body('reason').optional().isString().trim().isLength({ max: 500 })
  ], postAdminQuizresponsesStudentIdRecommend
);

router.get('/admin/hobbies-list',
  authenticateToken,
  requireRole(['admin']), getAdminHobbieslist
);

router.get('/admin/quiz-summary',
  authenticateToken,
  requireRole(['admin']), getAdminQuizsummary
);

router.delete('/admin/recommendations/:recommendationId',
  authenticateToken,
  requireRole(['admin']),
  [
    param('recommendationId').isInt().withMessage('Recommendation ID must be an integer')
  ], deleteAdminRecommendationsRecommendationId
);

export default router;
