import { Router, Request, Response } from "express";
import { param, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const getSellerStats = async (req: any, res: any) => {
const sellerId = req.user.userId;

const [totalProducts, totalOrders, totalRevenue, lowStockProducts] = await Promise.all([
  prisma.product.count({ where: { sellerId } }),
  prisma.orderItem.count({
    where: {
      product: { sellerId }
    }
  }),
  prisma.orderItem.aggregate({
    where: {
      product: { sellerId },
      order: {
        status: 'paid'
      }
    },
    _sum: {
      priceAtTime: true
    }
  }),
  prisma.product.count({
    where: {
      sellerId,
      stockCount: { lt: 10 }
    }
  })
]);

res.json({
  totalProducts,
  totalOrders,
  totalRevenue: totalRevenue._sum.priceAtTime || 0,
  lowStockProducts
});
};
export const getSellerProducts = async (req: any, res: any) => {
const sellerId = req.user.userId;

const products = await prisma.product.findMany({
  where: { sellerId },
  include: {
    category: true,
    reviews: true,
    orderItems: true
  },
  orderBy: { createdAt: 'desc' }
});

const productsWithStats = products.map(p => ({
  ...p,
  totalSold: p.orderItems.reduce((sum, item) => sum + item.quantity, 0),
  averageRating: p.reviews.length > 0 
    ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length 
    : 0
}));

res.json(productsWithStats);
};
export const getSellerOrders = async (req: any, res: any) => {
const sellerId = req.user.userId;

const orderItems = await prisma.orderItem.findMany({
  where: {
    product: { sellerId }
  },
  include: {
    product: true,
    order: {
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    }
  },
  orderBy: {
    order: {
      createdAt: 'desc'
    }
  }
});

const ordersMap = new Map();

for (const item of orderItems) {
  const orderId = item.order.id;
  if (!ordersMap.has(orderId)) {
    ordersMap.set(orderId, {
      orderId: item.order.id,
      customerName: `${item.order.user.profile?.firstName} ${item.order.user.profile?.lastName}`,
      customerEmail: item.order.user.email,
      orderStatus: item.order.status,
      createdAt: item.order.createdAt,
      items: []
    });
  }
  ordersMap.get(orderId).items.push({
    productName: item.product.name,
    quantity: item.quantity,
    price: item.priceAtTime,
    total: item.priceAtTime * item.quantity
  });
}

res.json(Array.from(ordersMap.values()));
};
export const putSellerOrdersOrderIdFulfill = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { orderId } = req.params;
const sellerId = req.user.userId;

const orderItems = await prisma.orderItem.findMany({
  where: {
    orderId: parseInt(orderId),
    product: { sellerId }
  }
});

if (orderItems.length === 0) {
  return res.status(404).json({ error: 'Order not found' });
}

const order = await prisma.order.update({
  where: { id: parseInt(orderId) },
  data: { status: 'shipped' }
});

res.json({ message: 'Order fulfilled', order });
};
export const getSellerInventoryAlerts = async (req: any, res: any) => {
const sellerId = req.user.userId;

const lowStock = await prisma.product.findMany({
  where: {
    sellerId,
    stockCount: { lt: 10 }
  },
  orderBy: { stockCount: 'asc' }
});

const outOfStock = await prisma.product.findMany({
  where: {
    sellerId,
    stockCount: 0
  }
});

res.json({
  lowStock,
  outOfStock,
  totalAlerts: lowStock.length + outOfStock.length
});
};
