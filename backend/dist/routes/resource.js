import { Router } from 'express';
import { body } from 'express-validator';
import fs from 'fs';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { uploadDir, upload, getResourcesTeacherLessons, getResourcesLessonLessonIdStudents, postResourcesShare, getResourcesStudent, getResourcesTeacherSent, getResourcesTeacherSubmissions, postResourcesSubmit, putResourcesIdRead, getResourcesIdDownload, deleteResourcesId } from "../controllers/resourceController.js";
const router = Router();
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
router.get('/resources/teacher/lessons', authenticateToken, requireRole(['teacher']), getResourcesTeacherLessons);
router.get('/resources/lesson/:lessonId/students', authenticateToken, requireRole(['teacher']), getResourcesLessonLessonIdStudents);
router.post('/resources/share', authenticateToken, requireRole(['teacher']), upload.single('file'), [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('receiverId').optional().isInt(),
    body('lessonId').optional().isInt(),
    body('shareToAll').optional().isBoolean()
], postResourcesShare);
router.get('/resources/student', authenticateToken, requireRole(['student']), getResourcesStudent);
router.get('/resources/teacher/sent', authenticateToken, requireRole(['teacher']), getResourcesTeacherSent);
router.get('/resources/teacher/submissions', authenticateToken, requireRole(['teacher']), getResourcesTeacherSubmissions);
router.post('/resources/submit', authenticateToken, requireRole(['student']), upload.single('file'), [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('teacherId').isInt(),
    body('lessonId').optional().isInt()
], postResourcesSubmit);
router.put('/resources/:id/read', authenticateToken, putResourcesIdRead);
router.get('/resources/:id/download', getResourcesIdDownload);
router.delete('/resources/:id', authenticateToken, deleteResourcesId);
export default router;
