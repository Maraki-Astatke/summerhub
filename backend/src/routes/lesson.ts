import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { lessonCreateLimiter, lessonRegisterLimiter, postLessons, getLessons, getLessonsId, putLessonsId, deleteLessonsId, postLessonsIdRegister, deleteLessonsIdUnregister, getMylessons, getTeacherLessons, postLessonsIdAttendance } from "../controllers/lessonController.js";

const router = Router();
router.post('/lessons',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  lessonCreateLimiter,
  [
    body('title').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('hobbyId').isInt(),
    body('dateTime').isISO8601(),
    body('durationMinutes').isInt({ min: 15, max: 180 }),
    body('maxStudents').isInt({ min: 1, max: 100 }),
    body('zoomLink').optional().isURL().trim()
  ], postLessons
);

router.get('/lessons',
  [
    query('hobbyId').optional().isInt(),
    query('teacherId').optional().isInt(),
    query('upcoming').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ], getLessons
);

router.get('/lessons/:id',
  [
    param('id').isInt()
  ], getLessonsId
);

router.put('/lessons/:id',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [
    param('id').isInt(),
    body('title').optional().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('hobbyId').optional().isInt(),
    body('dateTime').optional().isISO8601(),
    body('durationMinutes').optional().isInt({ min: 15, max: 180 }),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }),
    body('zoomLink').optional().isURL().trim(),
    body('recordingUrl').optional().isURL().trim()
  ], putLessonsId
);

router.delete('/lessons/:id',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [
    param('id').isInt()
  ], deleteLessonsId
);

router.post('/lessons/:id/register',
  authenticateToken,
  requireRole(['student', 'scholar']),
  lessonRegisterLimiter,
  [
    param('id').isInt()
  ], postLessonsIdRegister
);

router.delete('/lessons/:id/unregister',
  authenticateToken,
  requireRole(['student', 'scholar']),
  [
    param('id').isInt()
  ], deleteLessonsIdUnregister
);

router.get('/my-lessons',
  authenticateToken,
  requireRole(['student', 'scholar']), getMylessons
);

router.get('/teacher/lessons',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherLessons
);

router.post('/lessons/:id/attendance',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [
    param('id').isInt(),
    body('studentId').isInt(),
    body('attended').isBoolean()
  ], postLessonsIdAttendance
);

export default router;
