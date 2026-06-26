import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
export const getOrderstest = (req: any, res: any) => {
res.json({ message: 'Orders route is working!' });
};
export const getOrders = async (req: any, res: any) => {
try {
const userId = req.user.userId;

const orders = await prisma.order.findMany({
  where: { userId },
  include: {
    items: {
      include: {
        product: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});

res.json(orders);
} catch (error) {
console.error('Get orders error:', error);
res.status(500).json({ error: 'Failed to fetch orders' });
}
};
export const getOrdersId = async (req: any, res: any) => {
try {
const { id } = req.params;
const userId = req.user.userId;

const order = await prisma.order.findFirst({
  where: {
    id: parseInt(id),
    userId
  },
  include: {
    items: {
      include: {
        product: true
      }
    }
  }
});

if (!order) {
  return res.status(404).json({ error: 'Order not found' });
}

res.json(order);
} catch (error) {
console.error('Get order error:', error);
res.status(500).json({ error: 'Failed to fetch order' });
}
};
export const postOrders = async (req: any, res: any) => {
try {
const userId = req.user.userId;
const { shippingAddress, paymentMethod } = req.body;

console.log('📦 Creating order for user:', userId);

const cartItems = await prisma.cartItem.findMany({
  where: { userId },
  include: { product: true }
});

if (!cartItems || cartItems.length === 0) {
  return res.status(400).json({ error: 'Cart is empty' });
}

for (const item of cartItems) {
  if (item.product.stockCount < item.quantity) {
    return res.status(400).json({ 
      error: `${item.product.name} is out of stock. Only ${item.product.stockCount} left.` 
    });
  }
}

const totalAmount = cartItems.reduce((sum, item) => {
  return sum + (item.product.price * item.quantity);
}, 0);

const order = await prisma.$transaction(async (tx) => {
  const newOrder = await tx.order.create({
    data: {
      userId,
      totalAmount,
      status: paymentMethod === 'chapa' ? 'pending' : 'paid',
      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethod || null,
      items: {
        create: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtTime: item.product.price
        }))
      }
    },
    include: { items: true }
  });
  
  for (const item of cartItems) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockCount: {
          decrement: item.quantity
        }
      }
    });
    console.log(`📦 Stock reduced for product ${item.productId}: -${item.quantity}`);
  }
  
  await tx.cartItem.deleteMany({
    where: { userId }
  });
  
  return newOrder;
});

console.log('✅ Order created:', order.id);
console.log('✅ Stock updated and cart cleared');
res.status(201).json(order);
} catch (error) {
console.error('❌ Create order error:', error);
res.status(500).json({ error: `Failed to create order: ${error.message}` });
}
};
export const putOrdersIdStatus = async (req: any, res: any) => {
try {
const { id } = req.params;
const { status } = req.body;

const order = await prisma.order.update({
  where: { id: parseInt(id) },
  data: { status }
});

res.json(order);
} catch (error) {
console.error('Update order error:', error);
res.status(500).json({ error: 'Failed to update order' });
}
};
