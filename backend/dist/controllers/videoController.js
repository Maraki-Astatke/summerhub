import { validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { createRoom, deleteRoom } from "../services/video.js";
export const postVideoSessionsCreate = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { lessonId, topic, startTime, duration } = req.body;
    const teacherId = req.user.userId;
    const lesson = await prisma.lesson.findFirst({
        where: {
            id: lessonId,
            teacherId
        }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const roomName = `lesson-${lessonId}-${Date.now()}`;
    const dailyRoom = await createRoom(roomName);
    const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
            zoomLink: dailyRoom.url,
            dateTime: new Date(startTime),
            durationMinutes: duration
        }
    });
    res.status(201).json({
        roomUrl: dailyRoom.url,
        roomName: dailyRoom.name,
        startTime,
        duration,
        lesson: updatedLesson
    });
};
export const getVideoSessionsLessonIdJoin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { lessonId } = req.params;
    const userId = req.user.userId;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) },
        include: { registrations: true }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const isTeacher = lesson.teacherId === userId;
    const isRegistered = lesson.registrations.some(r => r.studentId === userId);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin');
    if (!isTeacher && !isRegistered && !isAdmin) {
        return res.status(403).json({ error: 'Not authorized to join this session' });
    }
    if (!lesson.zoomLink) {
        return res.status(404).json({ error: 'Video room not available' });
    }
    res.json({
        roomUrl: lesson.zoomLink,
        roomName: `lesson-${lessonId}`,
        isTeacher: isTeacher || isAdmin
    });
};
export const postVideoSessionsLessonIdEnd = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { lessonId } = req.params;
    const { recordingUrl } = req.body;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) }
    });
    if (lesson?.zoomLink) {
        const roomName = lesson.zoomLink.split('/').pop();
        await deleteRoom(roomName);
    }
    const updatedLesson = await prisma.lesson.update({
        where: { id: parseInt(lessonId) },
        data: {
            recordingUrl: recordingUrl || null
        }
    });
    res.json({ message: 'Session ended', recordingUrl: updatedLesson.recordingUrl });
};
export const getVideoRecordingsLessonId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { lessonId } = req.params;
    const userId = req.user.userId;
    const lesson = await prisma.lesson.findUnique({
        where: { id: parseInt(lessonId) },
        include: { registrations: true }
    });
    if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
    }
    const isTeacher = lesson.teacherId === userId;
    const isRegistered = lesson.registrations.some(r => r.studentId === userId);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } }
    });
    const isAdmin = user?.roles.some(r => r.role.name === 'admin');
    if (!isTeacher && !isRegistered && !isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
    }
    if (!lesson.recordingUrl) {
        return res.status(404).json({ error: 'Recording not available' });
    }
    res.json({
        recordingUrl: lesson.recordingUrl,
        lessonTitle: lesson.title,
        dateTime: lesson.dateTime
    });
};
