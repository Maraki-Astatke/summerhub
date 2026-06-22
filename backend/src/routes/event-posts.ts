import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// ============================================
// PUBLIC/AUTHENTICATED ROUTES
// ============================================

// Get all event posts (public or authenticated)
router.get('/event-posts', async (req, res) => {
  try {
    const posts = await prisma.eventPost.findMany({
      include: {
        author: {
          include: {
            profile: true
          }
        },
        _count: {
          select: { comments: true, likes: true }
        },
        likes: true,
        comments: {
          include: {
            user: { include: { profile: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching event posts:', error);
    res.status(500).json({ error: 'Failed to fetch event posts' });
  }
});

// Get a single event post
router.get('/event-posts/:id', [param('id').isInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;

  try {
    const post = await prisma.eventPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          include: { profile: true }
        },
        comments: {
          include: {
            user: { include: { profile: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        likes: true,
        _count: {
          select: { comments: true, likes: true }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Event post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching event post:', error);
    res.status(500).json({ error: 'Failed to fetch event post' });
  }
});

// Like/Unlike a post
router.post('/event-posts/:id/like', authenticateToken, [param('id').isInt()], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const postId = parseInt(req.params.id);
  const userId = req.user.userId;

  try {
    const post = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Event post not found' });
    }

    const existingLike = await prisma.eventPostLike.findUnique({
      where: {
        postId_userId: { postId, userId }
      }
    });

    if (existingLike) {
      await prisma.eventPostLike.delete({
        where: { id: existingLike.id }
      });
      return res.json({ message: 'Post unliked', liked: false });
    } else {
      await prisma.eventPostLike.create({
        data: { postId, userId }
      });
      return res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Add a comment
router.post('/event-posts/:id/comments', authenticateToken, [
  param('id').isInt(),
  body('content').notEmpty().trim().escape()
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const postId = parseInt(req.params.id);
  const userId = req.user.userId;
  const { content } = req.body;

  try {
    const post = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Event post not found' });
    }

    const comment = await prisma.eventPostComment.create({
      data: {
        postId,
        userId,
        content
      },
      include: {
        user: { include: { profile: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
router.delete('/event-posts/:id/comments/:commentId', authenticateToken, [
  param('id').isInt(),
  param('commentId').isInt()
], async (req: any, res: any) => {
  const postId = parseInt(req.params.id);
  const commentId = parseInt(req.params.commentId);
  const userId = req.user.userId;
  const userRoles = req.user.roles || [];

  try {
    const comment = await prisma.eventPostComment.findUnique({ where: { id: commentId } });
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.postId !== postId) {
      return res.status(400).json({ error: 'Comment does not belong to this post' });
    }

    const isAdmin = userRoles.includes('admin');
    if (comment.userId !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await prisma.eventPostComment.delete({ where: { id: commentId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Get admin's post history
router.get('/admin/event-posts', authenticateToken, requireRole(['admin']), async (req: any, res: any) => {
  const authorId = req.user.userId;
  
  try {
    const posts = await prisma.eventPost.findMany({
      where: { authorId },
      include: {
        _count: {
          select: { comments: true, likes: true }
        },
        likes: true,
        comments: {
          include: {
            user: { include: { profile: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching admin event posts:', error);
    res.status(500).json({ error: 'Failed to fetch admin event posts' });
  }
});

// Create a new event post
router.post('/admin/event-posts', authenticateToken, requireRole(['admin']), [
  body('title').notEmpty().trim(),
  body('date').notEmpty().trim(),
  body('time').notEmpty().trim(),
  body('location').notEmpty().trim(),
  body('about').notEmpty().trim(),
  body('whoCanJoin').notEmpty().trim(),
  body('howToRegister').notEmpty().trim(),
  body('contact').notEmpty().trim(),
  body('imageUrl').optional({ nullable: true, checkFalsy: true }).isURL()
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const authorId = req.user.userId;
  const { title, date, time, location, about, whoCanJoin, howToRegister, contact, imageUrl } = req.body;

  try {
    const post = await prisma.eventPost.create({
      data: {
        title,
        date,
        time,
        location,
        about,
        whoCanJoin,
        howToRegister,
        contact,
        imageUrl,
        authorId
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating event post:', error);
    res.status(500).json({ error: 'Failed to create event post' });
  }
});

// Update an event post
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
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const postId = parseInt(req.params.id);
  const authorId = req.user.userId;
  const updateData = req.body;

  try {
    const existingPost = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ error: 'Event post not found' });
    }
    
    // Check if the current admin is the author of the post or allow any admin? 
    // Usually, admins can edit any post, or just theirs. Let's allow any admin.
    
    const post = await prisma.eventPost.update({
      where: { id: postId },
      data: updateData
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating event post:', error);
    res.status(500).json({ error: 'Failed to update event post' });
  }
});

// Delete an event post
router.delete('/admin/event-posts/:id', authenticateToken, requireRole(['admin']), [
  param('id').isInt()
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const postId = parseInt(req.params.id);

  try {
    const existingPost = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!existingPost) {
      return res.status(404).json({ error: 'Event post not found' });
    }

    await prisma.eventPost.delete({ where: { id: postId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event post:', error);
    res.status(500).json({ error: 'Failed to delete event post' });
  }
});

export default router;
