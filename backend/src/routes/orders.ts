import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { getOrderstest, getOrders, getOrdersId, postOrders, putOrdersIdStatus } from "../controllers/ordersController.js";

const router = Router();

router.get('/orders-test', getOrderstest);

router.get('/orders', authenticateToken, getOrders);

router.get('/orders/:id', authenticateToken, getOrdersId);

router.post('/orders', authenticateToken, postOrders);

router.put('/orders/:id/status', authenticateToken, putOrdersIdStatus);

export default router;
