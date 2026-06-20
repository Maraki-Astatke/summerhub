import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many messages. Slow down.' }
});
router.get('/chat/messages/:userId', authenticateToken, [param('userId').isInt()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const otherUserId = parseInt(userId);
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        },
        orderBy: { createdAt: 'asc' },
        take: 100
    });
    await prisma.message.updateMany({
        where: {
            senderId: otherUserId,
            receiverId: currentUserId,
            isRead: false
        },
        data: { isRead: true }
    });
    res.json(messages);
});
router.post('/chat/messages/send', authenticateToken, chatLimiter, [
    body('receiverId').isInt(),
    body('content').notEmpty().isLength({ min: 1, max: 2000 }).trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;
    if (senderId === receiverId) {
        return res.status(400).json({ error: 'Cannot send message to yourself' });
    }
    const receiver = await prisma.user.findUnique({
        where: { id: receiverId }
    });
    if (!receiver) {
        return res.status(404).json({ error: 'Receiver not found' });
    }
    const message = await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content
        },
        include: {
            sender: {
                include: {
                    profile: true
                }
            },
            receiver: {
                include: {
                    profile: true
                }
            }
        }
    });
    res.status(201).json(message);
});
router.get('/chat/conversations', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        include: {
            sender: {
                include: {
                    profile: true
                }
            },
            receiver: {
                include: {
                    profile: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    const conversations = new Map();
    for (const message of messages) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        const otherUserId = otherUser.id;
        if (!conversations.has(otherUserId)) {
            conversations.set(otherUserId, {
                user: {
                    id: otherUser.id,
                    email: otherUser.email,
                    profile: otherUser.profile
                },
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount: 0
            });
        }
        if (!message.isRead && message.receiverId === userId) {
            const conv = conversations.get(otherUserId);
            conv.unreadCount++;
        }
    }
    res.json(Array.from(conversations.values()));
});
router.put('/chat/messages/read/:senderId', authenticateToken, [param('senderId').isInt()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { senderId } = req.params;
    const currentUserId = req.user.userId;
    await prisma.message.updateMany({
        where: {
            senderId: parseInt(senderId),
            receiverId: currentUserId,
            isRead: false
        },
        data: { isRead: true }
    });
    res.json({ message: 'Messages marked as read' });
});
router.get('/chat/unread/count', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const unreadCount = await prisma.message.count({
        where: {
            receiverId: userId,
            isRead: false
        }
    });
    res.json({ unreadCount });
});
router.delete('/chat/messages/:messageId', authenticateToken, [param('messageId').isInt()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { messageId } = req.params;
    const userId = req.user.userId;
    const message = await prisma.message.findUnique({
        where: { id: parseInt(messageId) }
    });
    if (!message) {
        return res.status(404).json({ error: 'Message not found' });
    }
    if (message.senderId !== userId) {
        return res.status(403).json({ error: 'Can only delete your own messages' });
    }
    await prisma.message.delete({
        where: { id: parseInt(messageId) }
    });
    res.status(204).send();
});
export default router;
