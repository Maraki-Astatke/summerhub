import { Router } from 'express';
import { body } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { quizSubmitLimiter, postAdminQuizQuestions, putAdminQuizQuestionsId, deleteAdminQuizQuestionsId, getQuizQuestions, postQuizSubmit, getQuizResults, getQuizRecommendations, getQuizProgress } from "../controllers/quizController.js";
const router = Router();
router.post('/admin/quiz/questions', authenticateToken, requireRole(['admin', 'teacher']), [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
], postAdminQuizQuestions);
router.put('/admin/quiz/questions/:id', authenticateToken, requireRole(['admin', 'teacher']), [
    body('question').notEmpty().isLength({ min: 5, max: 500 }).trim().escape()
], putAdminQuizQuestionsId);
router.delete('/admin/quiz/questions/:id', authenticateToken, requireRole(['admin', 'teacher']), deleteAdminQuizQuestionsId);
router.get('/quiz/questions', getQuizQuestions);
router.post('/quiz/submit', authenticateToken, requireRole(['student']), quizSubmitLimiter, [
    body('answers').isArray({ min: 1 }),
    body('answers.*.questionId').isInt(),
    body('answers.*.answer').isString().trim().isLength({ min: 1, max: 2000 })
], postQuizSubmit);
router.get('/quiz/results', authenticateToken, requireRole(['student']), getQuizResults);
router.get('/quiz/recommendations', authenticateToken, requireRole(['student']), getQuizRecommendations);
router.get('/quiz/progress', authenticateToken, requireRole(['student']), getQuizProgress);
export default router;
