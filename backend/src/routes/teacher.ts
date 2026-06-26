import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { uploadDir, storage, upload, getTeacherStats, postTeacherLessonsCreate, getTeacherLessons, getTeacherStudents, getTeacherStudentsStudentId, getTeacherLessonsUpcoming, postTeacherLessonsIdCancel, getTeacherRevenue, postTeacherCertificatesUpload, postTeacherCertificatesIssue, getTeacherCertificatesIssued, getStudentsCertificates, getCertificatesIdDownload } from "../controllers/teacherController.js";

const router = Router();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
router.get('/teacher/stats',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherStats
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
  ], postTeacherLessonsCreate
);

router.get('/teacher/lessons',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherLessons
);

router.get('/teacher/students',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherStudents
);

router.get('/teacher/students/:studentId',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [param('studentId').isInt()], getTeacherStudentsStudentId
);

router.get('/teacher/lessons/upcoming',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherLessonsUpcoming
);

router.post('/teacher/lessons/:id/cancel',
  authenticateToken,
  requireRole(['teacher', 'admin']),
  [param('id').isInt()], postTeacherLessonsIdCancel
);

router.get('/teacher/revenue',
  authenticateToken,
  requireRole(['teacher', 'admin']), getTeacherRevenue
);

router.post('/teacher/certificates/upload',
  authenticateToken,
  requireRole(['teacher']),
  upload.single('certificate'), postTeacherCertificatesUpload
);

router.post('/teacher/certificates/issue',
  authenticateToken,
  requireRole(['teacher']),
  [
    body('studentId').isInt(),
    body('customMessage').optional().trim()
  ], postTeacherCertificatesIssue
);

router.get('/teacher/certificates/issued',
  authenticateToken,
  requireRole(['teacher']), getTeacherCertificatesIssued
);

router.get('/students/certificates',
  authenticateToken,
  requireRole(['student']), getStudentsCertificates
);

router.get('/certificates/:id/download', getCertificatesIdDownload
);

export default router;
