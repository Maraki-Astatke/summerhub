import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { blogLimiter, postBlogPosts, getBlogPosts, getBlogPostsId, putBlogPostsId, deleteBlogPostsId, postBlogPostsIdComments, deleteBlogCommentsId, postBlogPostsIdLike, deleteBlogPostsIdUnlike } from "../controllers/blogController.js";

const router = Router();
router.post('/blog/posts',
  authenticateToken,
  blogLimiter,
  [
    body('title').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('content').notEmpty().isLength({ min: 20 }).trim().escape(),
    body('imageUrl').optional().isURL(),
    body('publishedAt').optional().isISO8601()
  ], postBlogPosts
);

router.get('/blog/posts',
  [
    query('authorId').optional().isInt(),
    query('search').optional().isString(),
    query('published').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ], getBlogPosts
);

router.get('/blog/posts/:id',
  [param('id').isInt()], getBlogPostsId
);

router.put('/blog/posts/:id',
  authenticateToken,
  [param('id').isInt()], putBlogPostsId
);

router.delete('/blog/posts/:id',
  authenticateToken,
  [param('id').isInt()], deleteBlogPostsId
);

router.post('/blog/posts/:id/comments',
  authenticateToken,
  [
    param('id').isInt(),
    body('content').notEmpty().isLength({ min: 2, max: 1000 }).trim().escape()
  ], postBlogPostsIdComments
);

router.delete('/blog/comments/:id',
  authenticateToken,
  [param('id').isInt()], deleteBlogCommentsId
);

router.post('/blog/posts/:id/like',
  authenticateToken,
  [param('id').isInt()], postBlogPostsIdLike
);

router.delete('/blog/posts/:id/unlike',
  authenticateToken,
  [param('id').isInt()], deleteBlogPostsIdUnlike
);

export default router;
