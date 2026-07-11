import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { postVideoSessionsCreate, getVideoSessionsLessonIdJoin, postVideoSessionsLessonIdEnd, getVideoRecordingsLessonId } from "../controllers/videoController.js";
const router = Router();
router.post('/video/sessions/create', authenticateToken, requireRole(['teacher', 'admin']), [
    body('lessonId').isInt(),
    body('topic').notEmpty().isLength({ min: 3, max: 200 }).trim().escape(),
    body('startTime').isISO8601(),
    body('duration').isInt({ min: 15, max: 180 })
], postVideoSessionsCreate);
router.get('/video/sessions/:lessonId/join', authenticateToken, [param('lessonId').isInt()], getVideoSessionsLessonIdJoin);
router.post('/video/sessions/:lessonId/end', authenticateToken, requireRole(['teacher', 'admin']), [param('lessonId').isInt()], postVideoSessionsLessonIdEnd);
router.get('/video/recordings/:lessonId', authenticateToken, [param('lessonId').isInt()], getVideoRecordingsLessonId);
export default router;
