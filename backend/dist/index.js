import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import hobbyRoutes from './routes/hobby.js';
import adminRoutes from './routes/admin.js';
import quizRoutes from './routes/quiz.js';
import lessonRoutes from './routes/lesson.js';
import dashboardRoutes from './routes/dashboard.js';
import resetRoutes from './routes/reset.js';
import marketplaceRoutes from './routes/marketplace.js';
import blogRoutes from './routes/blog.js';
import scholarshipRoutes from './routes/scholarship.js';
import eventRoutes from './routes/event.js';
import parentRoutes from './routes/parent.js';
import teacherRoutes from './routes/teacher.js';
import sellerRoutes from './routes/seller.js';
import videoRoutes from './routes/video.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notification.js';
import profileRoutes from './routes/profile.js';
import roleRoutes from './routes/roles.js';
import googleAuthRoutes from './routes/google-auth.js';
import paymentRoutes from './routes/payment.js';
import prisma from './lib/prisma.js';
import path from 'path';
import uploadRoutes from './routes/upload.js';
import adminQuizRoutes from './routes/admin-quiz.js';
import userRoutes from './routes/users.js';
import resourceRoutes from './routes/resource.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import eventPostRoutes from './routes/event-posts.js';
import scholarshipGiverRoutes from './routes/scholarshipGiver.js';
import certificateRoutes from './routes/certificateRoutes.js';
const app = express();
const PORT = process.env.PORT || 5001;
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['Cross-Origin-Resource-Policy']
}));
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', adminQuizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', googleAuthRoutes);
app.use('/api', hobbyRoutes);
app.use('/api', resetRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api', blogRoutes);
app.use('/api', scholarshipRoutes);
app.use('/api/scholarship-giver', scholarshipGiverRoutes);
app.use('/api', eventRoutes);
app.use('/api', eventPostRoutes);
app.use('/api', adminRoutes);
app.use('/api', quizRoutes);
app.use('/api', lessonRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', parentRoutes);
app.use('/api', teacherRoutes);
app.use('/api', resourceRoutes);
app.use('/api', sellerRoutes);
app.use('/api', videoRoutes);
app.use('/api', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api', notificationRoutes);
app.use('/api', profileRoutes);
app.use('/api', roleRoutes);
app.use('/api', paymentRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', certificateRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    setHeaders: (res, filePath, stat) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
}));
app.use('/api', uploadRoutes);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'HobbyHub Backend is running!',
        timestamp: new Date().toISOString()
    });
});
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true
    }
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication required'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = decoded;
        next();
    }
    catch (err) {
        next(new Error('Invalid token'));
    }
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.data.user?.userId);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.data.user?.userId} joined room ${roomId}`);
    });
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
    });
    socket.on('send-message', async (data) => {
        const { roomId, message, receiverId } = data;
        try {
            const savedMessage = await prisma.message.create({
                data: {
                    senderId: socket.data.user.userId,
                    receiverId: receiverId,
                    content: message,
                    isRead: false
                },
                include: {
                    sender: {
                        include: { profile: true }
                    },
                    receiver: {
                        include: { profile: true }
                    }
                }
            });
            io.to(`user-${receiverId}`).emit('new-message', savedMessage);
            socket.emit('message-sent', savedMessage);
        }
        catch (error) {
            console.error('Error saving message:', error);
        }
    });
    socket.on('typing', ({ receiverId, isTyping }) => {
        socket.to(`user-${receiverId}`).emit('user-typing', {
            userId: socket.data.user.userId,
            isTyping
        });
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.data.user?.userId);
    });
});
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`🔌 Socket.io ready`);
});
