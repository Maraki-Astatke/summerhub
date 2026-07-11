import { validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import multer from "multer";
import path from "path";
import fs from "fs";
export const regStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/talent-registrations';
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
export const regUpload = multer({
    storage: regStorage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /pdf|jpeg|jpg|png|gif|mp4|mov|avi|mkv|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime)
            return cb(null, true);
        cb(new Error('Only PDF, image, or video files are allowed'));
    }
});
export const getEventposts = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching event posts:', error);
        res.status(500).json({ error: 'Failed to fetch event posts' });
    }
};
export const getEventpostsId = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching event post:', error);
        res.status(500).json({ error: 'Failed to fetch event post' });
    }
};
export const postEventpostsIdLike = async (req, res) => {
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
        }
        else {
            await prisma.eventPostLike.create({
                data: { postId, userId }
            });
            return res.json({ message: 'Post liked', liked: true });
        }
    }
    catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
};
export const postEventpostsIdComments = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
export const deleteEventpostsIdCommentsCommentId = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
};
export const getAdminEventposts = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching admin event posts:', error);
        res.status(500).json({ error: 'Failed to fetch admin event posts' });
    }
};
export const postAdminEventposts = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error creating event post:', error);
        res.status(500).json({ error: 'Failed to create event post' });
    }
};
export const putAdminEventpostsId = async (req, res) => {
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
        const post = await prisma.eventPost.update({
            where: { id: postId },
            data: updateData
        });
        res.json(post);
    }
    catch (error) {
        console.error('Error updating event post:', error);
        res.status(500).json({ error: 'Failed to update event post' });
    }
};
export const deleteAdminEventpostsId = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting event post:', error);
        res.status(500).json({ error: 'Failed to delete event post' });
    }
};
export const getEventpostsId2 = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { id } = req.params;
    try {
        const post = await prisma.eventPost.findUnique({
            where: { id: parseInt(id) },
            include: { author: { include: { profile: true } }, _count: { select: { comments: true, likes: true } }, likes: true, comments: { include: { user: { include: { profile: true } } }, orderBy: { createdAt: 'desc' } } }
        });
        if (!post)
            return res.status(404).json({ error: 'Event post not found' });
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching event post:', error);
        res.status(500).json({ error: 'Failed to fetch event post' });
    }
};
export const postEventpostsIdRegister = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const postId = parseInt(req.params.id);
    const { name, phone, email } = req.body;
    try {
        const post = await prisma.eventPost.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ error: 'Event post not found' });
        if (!post.registrationOpen)
            return res.status(403).json({ error: 'Registration is not open for this event' });
        let fileUrl = null;
        let fileName = null;
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            fileUrl = `${protocol}://${host}/uploads/talent-registrations/${req.file.filename}`;
            fileName = req.file.originalname;
        }
        let userId = null;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
                userId = decoded.userId;
                const existing = await prisma.talentEventRegistration.findFirst({ where: { postId, userId } });
                if (existing)
                    return res.status(409).json({ error: 'You have already registered for this event', registration: existing });
            }
            catch { }
        }
        const { description } = req.body;
        const registration = await prisma.talentEventRegistration.create({
            data: { postId, name, phone, email, description: description || null, fileUrl, fileName, userId }
        });
        res.status(201).json({ message: 'Registration submitted successfully!', registration });
    }
    catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ error: 'Failed to submit registration' });
    }
};
export const getAdminEventpostsIdRegistrations = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const postId = parseInt(req.params.id);
    try {
        const registrations = await prisma.talentEventRegistration.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(registrations);
    }
    catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
};
export const deleteAdminEventpostsRegistrationsRegId = async (req, res) => {
    const regId = parseInt(req.params.regId);
    try {
        await prisma.talentEventRegistration.delete({ where: { id: regId } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ error: 'Failed to delete registration' });
    }
};
export const patchAdminEventpostsIdToggleregistration = async (req, res) => {
    const postId = parseInt(req.params.id);
    try {
        const post = await prisma.eventPost.findUnique({ where: { id: postId } });
        if (!post)
            return res.status(404).json({ error: 'Post not found' });
        const updated = await prisma.eventPost.update({
            where: { id: postId },
            data: { registrationOpen: !post.registrationOpen }
        });
        res.json({ registrationOpen: updated.registrationOpen });
    }
    catch (error) {
        console.error('Error toggling registration:', error);
        res.status(500).json({ error: 'Failed to toggle registration' });
    }
};
export const getEventpostsIdMyregistration = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;
    try {
        const registration = await prisma.talentEventRegistration.findFirst({
            where: { postId, userId }
        });
        res.json({ registration: registration || null });
    }
    catch (error) {
        console.error('Error fetching my registration:', error);
        res.status(500).json({ error: 'Failed to fetch registration' });
    }
};
export const deleteEventpostsIdMyregistration = async (req, res) => {
    const postId = parseInt(req.params.id);
    const userId = req.user.userId;
    try {
        const registration = await prisma.talentEventRegistration.findFirst({
            where: { postId, userId }
        });
        if (!registration)
            return res.status(404).json({ error: 'Registration not found' });
        await prisma.talentEventRegistration.delete({ where: { id: registration.id } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error unregistering:', error);
        res.status(500).json({ error: 'Failed to unregister' });
    }
};
