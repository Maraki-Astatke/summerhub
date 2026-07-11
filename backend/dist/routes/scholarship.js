import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { scholarshipLimiter, postScholarships, getScholarships, getScholarshipsId, putScholarshipsId, deleteScholarshipsId, postScholarshipsIdApply, getScholarshipsApplications, putScholarshipsApplicationsId, getMyapplications } from "../controllers/scholarshipController.js";
const router = Router();
router.post('/scholarships', authenticateToken, requireRole(['scholarship_giver', 'admin']), [
    body('name').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('amount').isFloat({ min: 0 }),
    body('requirements').optional().isLength({ max: 1000 }).trim().escape(),
    body('deadline').isISO8601()
], postScholarships);
router.get('/scholarships', [
    query('active').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], getScholarships);
router.get('/scholarships/:id', [param('id').isInt()], getScholarshipsId);
router.put('/scholarships/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), [param('id').isInt()], putScholarshipsId);
router.delete('/scholarships/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), [param('id').isInt()], deleteScholarshipsId);
router.post('/scholarships/:id/apply', authenticateToken, requireRole(['student']), scholarshipLimiter, [
    param('id').isInt(),
    body('essayText').optional().isLength({ max: 2000 }).trim().escape()
], postScholarshipsIdApply);
router.get('/scholarships/applications', authenticateToken, requireRole(['scholarship_giver', 'admin']), getScholarshipsApplications);
router.put('/scholarships/applications/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), [
    param('id').isInt(),
    body('status').isIn(['pending', 'approved', 'rejected'])
], putScholarshipsApplicationsId);
router.get('/my-applications', authenticateToken, requireRole(['student']), getMyapplications);
export default router;
