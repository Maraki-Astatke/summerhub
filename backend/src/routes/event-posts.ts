import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Multer setup for registration file uploads
const regStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/talent-registrations';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const regUpload = multer({
  storage: regStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png|gif|mp4|mov|avi|mkv|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only PDF, image, or video files are allowed'));
  }
});

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
  body('howToRegister').optional().trim(),
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

// ============================================
// TALENT EVENT REGISTRATIONS
// ============================================

// Get a single post by ID (public) — for the registration page
router.get('/event-posts/:id', [param('id').isInt()], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { id } = req.params;
  try {
    const post = await prisma.eventPost.findUnique({
      where: { id: parseInt(id) },
      include: { author: { include: { profile: true } }, _count: { select: { comments: true, likes: true } }, likes: true, comments: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } } }
    });
    if (!post) return res.status(404).json({ error: 'Event post not found' });
    res.json(post);
  } catch (error) {
    console.error('Error fetching event post:', error);
    res.status(500).json({ error: 'Failed to fetch event post' });
  }
});

// Submit registration for a talent event (public — no auth required)
router.post('/event-posts/:id/register', regUpload.single('file'), [
  param('id').isInt(),
  body('name').notEmpty().trim(),
  body('phone').notEmpty().trim(),
  body('email').notEmpty().isEmail().normalizeEmail(),
], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const postId = parseInt(req.params.id);
  const { name, phone, email } = req.body;

  try {
    const post = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Event post not found' });
    if (!post.registrationOpen) return res.status(403).json({ error: 'Registration is not open for this event' });

    let fileUrl = null;
    let fileName = null;
    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      fileUrl = `${protocol}://${host}/uploads/talent-registrations/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    // Save userId if user is authenticated (token in header)
    let userId: number | null = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
        // Prevent duplicate registration by same user
        const existing = await prisma.talentEventRegistration.findFirst({ where: { postId, userId } });
        if (existing) return res.status(409).json({ error: 'You have already registered for this event', registration: existing });
      } catch { /* ignore invalid token */ }
    }

    const { description } = req.body;
    const registration = await prisma.talentEventRegistration.create({
      data: { postId, name, phone, email, description: description || null, fileUrl, fileName, userId }
    });
    res.status(201).json({ message: 'Registration submitted successfully!', registration });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

// Get all registrations for an event (admin only)
router.get('/admin/event-posts/:id/registrations', authenticateToken, requireRole(['admin']), [param('id').isInt()], async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const postId = parseInt(req.params.id);
  try {
    const registrations = await prisma.talentEventRegistration.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Delete a registration (admin only)
router.delete('/admin/event-posts/registrations/:regId', authenticateToken, requireRole(['admin']), [param('regId').isInt()], async (req: any, res: any) => {
  const regId = parseInt(req.params.regId);
  try {
    await prisma.talentEventRegistration.delete({ where: { id: regId } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
});

// Toggle registration open/closed (admin only)
router.patch('/admin/event-posts/:id/toggle-registration', authenticateToken, requireRole(['admin']), [param('id').isInt()], async (req: any, res: any) => {
  const postId = parseInt(req.params.id);
  try {
    const post = await prisma.eventPost.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const updated = await prisma.eventPost.update({
      where: { id: postId },
      data: { registrationOpen: !post.registrationOpen }
    });
    res.json({ registrationOpen: updated.registrationOpen });
  } catch (error) {
    console.error('Error toggling registration:', error);
    res.status(500).json({ error: 'Failed to toggle registration' });
  }
});

// Get current user's registration for a specific event
router.get('/event-posts/:id/my-registration', authenticateToken, [param('id').isInt()], async (req: any, res: any) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.userId;
  try {
    const registration = await prisma.talentEventRegistration.findFirst({
      where: { postId, userId }
    });
    res.json({ registration: registration || null });
  } catch (error) {
    console.error('Error fetching my registration:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

// Unregister current user from a talent event
router.delete('/event-posts/:id/my-registration', authenticateToken, [param('id').isInt()], async (req: any, res: any) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.userId;
  try {
    const registration = await prisma.talentEventRegistration.findFirst({
      where: { postId, userId }
    });
    if (!registration) return res.status(404).json({ error: 'Registration not found' });
    await prisma.talentEventRegistration.delete({ where: { id: registration.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Error unregistering:', error);
    res.status(500).json({ error: 'Failed to unregister' });
  }
});

export default router;
