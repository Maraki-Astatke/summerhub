import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { eventLimiter, postEvents, getEvents, getEventsId, putEventsId, deleteEventsId, postEventsIdRegister, deleteEventsIdUnregister, postEventsIdSubmitperformance, getMyevents } from "../controllers/eventController.js";
const router = Router();
router.post('/events', authenticateToken, requireRole(['admin']), [
    body('name').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('date').isISO8601(),
    body('prize').optional().isLength({ max: 500 }).trim().escape(),
    body('maxParticipants').isInt({ min: 1, max: 500 }),
    body('imageUrl').optional().isURL()
], postEvents);
router.get('/events', [
    query('upcoming').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], getEvents);
router.get('/events/:id', [param('id').isInt()], getEventsId);
router.put('/events/:id', authenticateToken, requireRole(['admin']), [param('id').isInt()], putEventsId);
router.delete('/events/:id', authenticateToken, requireRole(['admin']), [param('id').isInt()], deleteEventsId);
router.post('/events/:id/register', authenticateToken, requireRole(['student', 'scholar']), eventLimiter, [param('id').isInt()], postEventsIdRegister);
router.delete('/events/:id/unregister', authenticateToken, requireRole(['student', 'scholar']), [param('id').isInt()], deleteEventsIdUnregister);
router.post('/events/:id/submit-performance', authenticateToken, requireRole(['student', 'scholar']), [
    param('id').isInt(),
    body('performanceLink').isURL()
], postEventsIdSubmitperformance);
router.get('/my-events', authenticateToken, requireRole(['student', 'scholar']), getMyevents);
export default router;
