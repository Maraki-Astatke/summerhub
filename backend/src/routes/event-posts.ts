import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { regStorage, regUpload, getEventposts, getEventpostsId, postEventpostsIdLike, postEventpostsIdComments, deleteEventpostsIdCommentsCommentId, getAdminEventposts, postAdminEventposts, putAdminEventpostsId, deleteAdminEventpostsId, getEventpostsId2, postEventpostsIdRegister, getAdminEventpostsIdRegistrations, deleteAdminEventpostsRegistrationsRegId, patchAdminEventpostsIdToggleregistration, getEventpostsIdMyregistration, deleteEventpostsIdMyregistration } from "../controllers/event-postsController.js";

const router = Router();
router.get('/event-posts', getEventposts);

router.get('/event-posts/:id', [param('id').isInt()], getEventpostsId);

router.post('/event-posts/:id/like', authenticateToken, [param('id').isInt()], postEventpostsIdLike);

router.post('/event-posts/:id/comments', authenticateToken, [
  param('id').isInt(),
  body('content').notEmpty().trim().escape()
], postEventpostsIdComments);

router.delete('/event-posts/:id/comments/:commentId', authenticateToken, [
  param('id').isInt(),
  param('commentId').isInt()
], deleteEventpostsIdCommentsCommentId);

router.get('/admin/event-posts', authenticateToken, requireRole(['admin']), getAdminEventposts);

router.post('/admin/event-posts', authenticateToken, requireRole(['admin']), [
  body('title').notEmpty().trim(),
  body('date').notEmpty().trim(),
  body('time').notEmpty().trim(),
  body('location').notEmpty().trim(),
  body('about').notEmpty().trim(),
  body('whoCanJoin').notEmpty().trim(),
  body('howToRegister').optional().trim(),
  body('contact').notEmpty().trim(),
  body('imageUrl').optional({ nullable: true, checkFalsy: true }).isURL()
], postAdminEventposts);

router.put('/admin/event-posts/:id', authenticateToken, requireRole(['admin']), [
  param('id').isInt(),
  body('title').optional().trim(),
  body('date').optional().trim(),
  body('time').optional().trim(),
  body('location').optional().trim(),
  body('about').optional().trim(),
  body('whoCanJoin').optional().trim(),
  body('howToRegister').optional().trim(),
  body('contact').optional().trim(),
  body('imageUrl').optional({ nullable: true, checkFalsy: true }).isURL()
], putAdminEventpostsId);

router.delete('/admin/event-posts/:id', authenticateToken, requireRole(['admin']), [
  param('id').isInt()
], deleteAdminEventpostsId);

router.get('/event-posts/:id', [param('id').isInt()], getEventpostsId2);

router.post('/event-posts/:id/register', regUpload.single('file'), [
  param('id').isInt(),
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('email').notEmpty().isEmail().normalizeEmail(),
], postEventpostsIdRegister);

router.get('/admin/event-posts/:id/registrations', authenticateToken, requireRole(['admin']), [param('id').isInt()], getAdminEventpostsIdRegistrations);

router.delete('/admin/event-posts/registrations/:regId', authenticateToken, requireRole(['admin']), [param('regId').isInt()], deleteAdminEventpostsRegistrationsRegId);

router.patch('/admin/event-posts/:id/toggle-registration', authenticateToken, requireRole(['admin']), [param('id').isInt()], patchAdminEventpostsIdToggleregistration);

router.get('/event-posts/:id/my-registration', authenticateToken, [param('id').isInt()], getEventpostsIdMyregistration);

router.delete('/event-posts/:id/my-registration', authenticateToken, [param('id').isInt()], deleteEventpostsIdMyregistration);

export default router;

