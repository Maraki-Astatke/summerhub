import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import prisma from '../lib/prisma.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getSellerStats, getSellerProducts, getSellerOrders, putSellerOrdersOrderIdFulfill, getSellerInventoryAlerts } from "../controllers/sellerController.js";

const router = Router();

router.get('/seller/stats',
  authenticateToken,
  requireRole(['seller', 'admin']), getSellerStats
);

router.get('/seller/products',
  authenticateToken,
  requireRole(['seller', 'admin']), getSellerProducts
);

router.get('/seller/orders',
  authenticateToken,
  requireRole(['seller', 'admin']), getSellerOrders
);

router.put('/seller/orders/:orderId/fulfill',
  authenticateToken,
  requireRole(['seller', 'admin']),
  [param('orderId').isInt()], putSellerOrdersOrderIdFulfill
);

router.get('/seller/inventory/alerts',
  authenticateToken,
  requireRole(['seller', 'admin']), getSellerInventoryAlerts
);

export default router;
