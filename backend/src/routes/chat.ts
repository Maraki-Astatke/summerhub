import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { chatLimiter, getChatMessagesUserId, postChatMessagesSend, getChatConversations, putChatMessagesReadSenderId, getChatUnreadCount, deleteChatMessagesMessageId } from "../controllers/chatController.js";

const router = Router();
router.get('/chat/messages/:userId',
  authenticateToken,
  [param('userId').isInt()], getChatMessagesUserId
);

router.post('/chat/messages/send',
  authenticateToken,
  chatLimiter,
  [
    body('receiverId').isInt(),
    body('content').notEmpty().isLength({ min: 1, max: 2000 }).trim().escape()
  ], postChatMessagesSend
);

router.get('/chat/conversations',
  authenticateToken, getChatConversations
);

router.put('/chat/messages/read/:senderId',
  authenticateToken,
  [param('senderId').isInt()], putChatMessagesReadSenderId
);

router.get('/chat/unread/count',
  authenticateToken, getChatUnreadCount
);

router.delete('/chat/messages/:messageId',
  authenticateToken,
  [param('messageId').isInt()], deleteChatMessagesMessageId
);

export default router;
