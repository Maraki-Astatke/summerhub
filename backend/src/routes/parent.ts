import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { postParentChildrenLink, getParentChildren, getParentChildIdProgress, getParentChildIdLessons, getParentChildIdQuizresults, postParentChildIdApprovepurchase } from "../controllers/parentController.js";

const router = Router();

router.post('/parent/children/link',
  authenticateToken,
  requireRole(['parent']),
  [
    body('childEmail').optional().isEmail().normalizeEmail(),
    body('childPhone').optional().matches(/^(09|07)[0-9]{8}$/)
  ], postParentChildrenLink
);

router.get('/parent/children',
  authenticateToken,
  requireRole(['parent']), getParentChildren
);

router.get('/parent/child/:id/progress',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()], getParentChildIdProgress
);

router.get('/parent/child/:id/lessons',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()], getParentChildIdLessons
);

router.get('/parent/child/:id/quiz-results',
  authenticateToken,
  requireRole(['parent']),
  [param('id').isInt()], getParentChildIdQuizresults
);

router.post('/parent/child/:id/approve-purchase',
  authenticateToken,
  requireRole(['parent']),
  [
    param('id').isInt(),
    body('orderId').isInt(),
    body('approved').isBoolean()
  ], postParentChildIdApprovepurchase
);

export default router;
