import { Router } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
const router = Router();
const lessonCreateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: 'Too many lesson creation attempts. Try again later.' }
});
const lessonRegisterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { error: 'Too many registration attempts. Try again later.' }
});
router.post('/lessons', authenticateToken, requireRole(['teacher', 'admin']), lessonCreateLimiter, [
    body('title').notEmpty().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('hobbyId').isInt(),
    body('dateTime').isISO8601(),
    body('durationMinutes').isInt({ min: 15, max: 180 }),
    body('maxStudents').isInt({ min: 1, max: 100 }),
    body('zoomLink').optional().isURL().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { title, description, hobbyId, dateTime, durationMinutes, maxStudents, zoomLink } = req.body;
    const teacherId = req.user.userId;
    const hobby = await prisma.hobby.findUnique({
        where: { id: hobbyId }
    });
    if (!hobby) {
        return res.status(400).json({ error: 'Hobby not found' });
    }
    const lesson = await prisma.lesson.create({
        data: {
            title,
            description,
            teacherId,
            hobbyId,
            dateTime: new Date(dateTime),
            durationMinutes,
            maxStudents,
            zoomLink
        },
        include: {
            teacher: {
                include: {
                    profile: true
                }
            },
            hobby: true
        }
    });
    res.status(201).json(lesson);
});
router.get('/lessons', [
    query('hobbyId').optional().isInt(),
    query('teacherId').optional().isInt(),
    query('upcoming').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { hobbyId, teacherId, upcoming, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (hobbyId) {
        where.hobbyId = parseInt(hobbyId);
    }
    if (teacherId) {
        where.teacherId = parseInt(teacherId);
    }
    if (upcoming === 'true') {
        where.dateTime = { gt: new Date() };
    }
    const [lessons, total] = await Promise.all([
        prisma.lesson.findMany({
            where,
            include: {
                teacher: {
                    include: {
                        profile: true
                    }
                },
                hobby: true,
                registrations: {
                    include: {
                        student: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            },
            skip,
            take: limitNum,
            orderBy: {
                dateTime: 'asc'
            }
        }),
        prisma.lesson.count({ where })
    ]);
    res.json({
        data: lessons,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
        }
    });
});
router.get('/lessons/:id', [
    param('id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) },
        include: {
            teacher: {
                include: {
                    profile: true
                }
            },
            hobby: true,
            registrations: {
                include: {
                    student: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
});
router.put('/lessons/:id', authenticateToken, requireRole(['teacher', 'admin']), [
    param('id').isInt(),
    body('title').optional().isLength({ min: 5, max: 200 }).trim().escape(),
    body('description').optional().isLength({ max: 2000 }).trim().escape(),
    body('hobbyId').optional().isInt(),
    body('dateTime').optional().isISO8601(),
    body('durationMinutes').optional().isInt({ min: 15, max: 180 }),
    body('maxStudents').optional().isInt({ min: 1, max: 100 }),
    body('zoomLink').optional().isURL().trim(),
    body('recordingUrl').optional().isURL().trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { title, description, hobbyId, dateTime, durationMinutes, maxStudents, zoomLink, recordingUrl } = req.body;
    const userId = req.user.userId;
    const existingLesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }
    });
    if (!existingLesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin') || false;
    if (!isAdmin && existingLesson.teacherId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own lessons' });
    }
    const updateData = {};
    if (title)
        updateData.title = title;
    if (description !== undefined)
        updateData.description = description;
    if (hobbyId)
        updateData.hobbyId = hobbyId;
    if (dateTime)
        updateData.dateTime = new Date(dateTime);
    if (durationMinutes)
        updateData.durationMinutes = durationMinutes;
    if (maxStudents)
        updateData.maxStudents = maxStudents;
    if (zoomLink !== undefined)
        updateData.zoomLink = zoomLink;
    if (recordingUrl !== undefined)
        updateData.recordingUrl = recordingUrl;
    const lesson = await prisma.lesson.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
            teacher: {
                include: {
                    profile: true
                }
            },
            hobby: true
        }
    });
    res.json(lesson);
});
router.delete('/lessons/:id', authenticateToken, requireRole(['teacher', 'admin']), [
    param('id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const userId = req.user.userId;
    const existingLesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }
    });
    if (!existingLesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin') || false;
    if (!isAdmin && existingLesson.teacherId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own lessons' });
    }
    await prisma.lesson.delete({
        where: { id: parseInt(id) }
    });
    res.status(204).send();
});
router.post('/lessons/:id/register', authenticateToken, requireRole(['student', 'scholar']), lessonRegisterLimiter, [
    param('id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const studentId = req.user.userId;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) },
        include: {
            registrations: true
        }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    if (lesson.dateTime < new Date()) {
        return res.status(400).json({ error: 'Cannot register for past lessons' });
    }
    if (lesson.registrations.length >= lesson.maxStudents) {
        return res.status(400).json({ error: 'Lesson is full' });
    }
    const existingRegistration = await prisma.lessonRegistration.findUnique({
        where: {
            lessonId_studentId: {
                lessonId: parseInt(id),
                studentId
            }
        }
    });
    if (existingRegistration) {
        return res.status(400).json({ error: 'Already registered for this lesson' });
    }
    const registration = await prisma.lessonRegistration.create({
        data: {
            lessonId: parseInt(id),
            studentId
        },
        include: {
            lesson: true,
            student: {
                include: {
                    profile: true
                }
            }
        }
    });
    res.status(201).json(registration);
});
router.delete('/lessons/:id/unregister', authenticateToken, requireRole(['student', 'scholar']), [
    param('id').isInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const studentId = req.user.userId;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    if (lesson.dateTime < new Date()) {
        return res.status(400).json({ error: 'Cannot unregister from past lessons' });
    }
    await prisma.lessonRegistration.delete({
        where: {
            lessonId_studentId: {
                lessonId: parseInt(id),
                studentId
            }
        }
    });
    res.status(204).send();
});
router.get('/my-lessons', authenticateToken, requireRole(['student', 'scholar']), async (req, res) => {
    const studentId = req.user.userId;
    const registrations = await prisma.lessonRegistration.findMany({
        where: { studentId },
        include: {
            lesson: {
                include: {
                    teacher: {
                        include: {
                            profile: true
                        }
                    },
                    hobby: true
                }
            }
        },
        orderBy: {
            lesson: {
                dateTime: 'asc'
            }
        }
    });
    const upcomingLessons = registrations.filter(r => r.lesson.dateTime > new Date());
    const pastLessons = registrations.filter(r => r.lesson.dateTime <= new Date());
    res.json({
        upcoming: upcomingLessons,
        past: pastLessons
    });
});
router.get('/teacher/lessons', authenticateToken, requireRole(['teacher', 'admin']), async (req, res) => {
    const teacherId = req.user.userId;
    const lessons = await prisma.lesson.findMany({
        where: { teacherId },
        include: {
            hobby: true,
            registrations: {
                include: {
                    student: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        },
        orderBy: {
            dateTime: 'desc'
        }
    });
    res.json(lessons);
});
router.post('/lessons/:id/attendance', authenticateToken, requireRole(['teacher', 'admin']), [
    param('id').isInt(),
    body('studentId').isInt(),
    body('attended').isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { studentId, attended } = req.body;
    const teacherId = req.user.userId;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(id) }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const user = await prisma.user.findUnique({
        where: { id: teacherId },
        include: {
            roles: {
                include: {
                    role: true
                }
            }
        }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin') || false;
    if (!isAdmin && lesson.teacherId !== teacherId) {
        return res.status(403).json({ error: 'You can only mark attendance for your own lessons' });
    }
    const registration = await prisma.lessonRegistration.update({
        where: {
            lessonId_studentId: {
                lessonId: parseInt(id),
                studentId
            }
        },
        data: { attended }
    });
    res.json(registration);
});
export default router;
