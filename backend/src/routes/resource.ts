import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

const uploadDir = 'uploads/resources';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

router.get('/resources/teacher/lessons',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    try {
      const teacherId = req.user.userId;
      
      const lessons = await prisma.lesson.findMany({
        where: { teacherId },
        select: {
          id: true,
          title: true,
          dateTime: true
        },
        orderBy: { dateTime: 'desc' }
      });
      
      res.json(lessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  }
);

router.get('/resources/lesson/:lessonId/students',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    try {
      const { lessonId } = req.params;
      const teacherId = req.user.userId;
      
      const registrations = await prisma.lessonRegistration.findMany({
        where: {
          lessonId: parseInt(lessonId),
          lesson: { teacherId }
        },
        include: {
          student: {
            include: { profile: true }
          }
        }
      });
      
      const students = registrations.map(reg => ({
        id: reg.student.id,
        name: `${reg.student.profile?.firstName || ''} ${reg.student.profile?.lastName || ''}`.trim(),
        email: reg.student.email
      }));
      
      res.json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  }
);

router.post('/resources/share',
  authenticateToken,
  requireRole(['teacher']),
  upload.single('file'),
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('receiverId').optional().isInt(),
    body('lessonId').optional().isInt(),
    body('shareToAll').optional().isBoolean()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, receiverId, lessonId, shareToAll } = req.body;
      const senderId = req.user.userId;
      
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;
      
      if (req.file) {
        fileUrl = `/uploads/resources/${req.file.filename}`;
        fileName = req.file.originalname;
        fileType = req.file.mimetype.split('/')[0];
        fileSize = req.file.size;
      }
      
      const resources = [];
      
      if (shareToAll === 'true' && lessonId) {
        const registrations = await prisma.lessonRegistration.findMany({
          where: { lessonId: parseInt(lessonId) },
          include: { student: true }
        });
        
        for (const reg of registrations) {
          const resource = await prisma.resource.create({
            data: {
              title,
              description: description || null,
              fileName,
              fileUrl,
              fileType,
              fileSize,
              senderId,
              receiverId: reg.studentId,
              lessonId: parseInt(lessonId),
              isRead: false
            },
            include: {
              receiver: {
                include: { profile: true }
              }
            }
          });
          resources.push(resource);
        }
      } else if (receiverId) {
        const resource = await prisma.resource.create({
          data: {
            title,
            description: description || null,
            fileName,
            fileUrl,
            fileType,
            fileSize,
            senderId,
            receiverId: parseInt(receiverId),
            lessonId: lessonId ? parseInt(lessonId) : null,
            isRead: false
          },
          include: {
            receiver: {
              include: { profile: true }
            }
          }
        });
        resources.push(resource);
      }
      
      res.status(201).json({
        message: `Resource shared to ${resources.length} student(s)`,
        resources
      });
    } catch (error) {
      console.error('Error sharing resource:', error);
      res.status(500).json({ error: 'Failed to share resource' });
    }
  }
);

router.get('/resources/student',
  authenticateToken,
  requireRole(['student']),
  async (req, res) => {
    try {
      const studentId = req.user.userId;
      
      const resources = await prisma.resource.findMany({
        where: {
          receiverId: studentId
        },
        include: {
          sender: {
            include: { profile: true }
          },
          lesson: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(resources);
    } catch (error) {
      console.error('Error fetching student resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  }
);

router.get('/resources/teacher/sent',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    try {
      const teacherId = req.user.userId;
      
      const resources = await prisma.resource.findMany({
        where: {
          senderId: teacherId
        },
        include: {
          receiver: {
            include: { profile: true }
          },
          lesson: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(resources);
    } catch (error) {
      console.error('Error fetching teacher resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  }
);

router.get('/resources/teacher/submissions',
  authenticateToken,
  requireRole(['teacher']),
  async (req, res) => {
    try {
      const teacherId = req.user.userId;
      
      const submissions = await prisma.resource.findMany({
        where: {
          receiverId: teacherId
        },
        include: {
          sender: {
            include: { profile: true }
          },
          lesson: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  }
);

router.post('/resources/submit',
  authenticateToken,
  requireRole(['student']),
  upload.single('file'),
  [
    body('title').notEmpty().trim(),
    body('description').optional().trim(),
    body('teacherId').isInt(),
    body('lessonId').optional().isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, teacherId, lessonId } = req.body;
      const studentId = req.user.userId;
      
      let fileUrl = null;
      let fileName = null;
      let fileType = null;
      let fileSize = null;
      
      if (req.file) {
        fileUrl = `/uploads/resources/${req.file.filename}`;
        fileName = req.file.originalname;
        fileType = req.file.mimetype.split('/')[0];
        fileSize = req.file.size;
      }
      
      const resource = await prisma.resource.create({
        data: {
          title,
          description: description || null,
          fileName,
          fileUrl,
          fileType,
          fileSize,
          senderId: studentId,
          receiverId: parseInt(teacherId),
          lessonId: lessonId ? parseInt(lessonId) : null,
          isRead: false
        },
        include: {
          receiver: {
            include: { profile: true }
          }
        }
      });
      
      res.status(201).json({
        message: 'Assignment submitted successfully',
        resource
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      res.status(500).json({ error: 'Failed to submit assignment' });
    }
  }
);

router.put('/resources/:id/read',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const resource = await prisma.resource.findFirst({
        where: {
          id: parseInt(id),
          receiverId: userId
        }
      });
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      await prisma.resource.update({
        where: { id: parseInt(id) },
        data: { isRead: true }
      });
      
      res.json({ message: 'Resource marked as read' });
    } catch (error) {
      console.error('Error marking resource as read:', error);
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  }
);

router.get('/resources/:id/download',
  async (req, res) => {
    try {
      const { id } = req.params;
      const token = req.query.token as string;
      
      if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }

      let userId: number;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        userId = decoded.userId;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const resource = await prisma.resource.findFirst({
        where: {
          id: parseInt(id),
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      });

      if (!resource || !resource.fileUrl) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const filePath = path.join(process.cwd(), resource.fileUrl);
      
      if (fs.existsSync(filePath)) {
        res.download(filePath, resource.fileName || 'download');
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      res.status(500).json({ error: 'Failed to download resource' });
    }
  }
);

router.delete('/resources/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const resource = await prisma.resource.findFirst({
        where: {
          id: parseInt(id),
          senderId: userId
        }
      });
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      if (resource.fileUrl) {
        const filePath = path.join(process.cwd(), resource.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await prisma.resource.delete({
        where: { id: parseInt(id) }
      });
      
      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  }
);

export default router;