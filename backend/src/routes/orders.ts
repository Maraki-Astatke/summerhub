import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Test route to verify file is loaded
router.get('/orders-test', (req, res) => {
  res.json({ message: 'Orders route is working!' });
});

// GET all orders for the logged-in user
router.get('/orders', authenticateToken, async (req, res) => {
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
});

// GET single order
router.get('/orders/:id', authenticateToken, async (req, res) => {
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
});

// CREATE order from cart (with stock reduction)
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingAddress, paymentMethod } = req.body;
    
    console.log('📦 Creating order for user:', userId);
    
    // Get cart items directly
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    });
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // ✅ Check stock before creating order
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
    
    // ✅ Use transaction to ensure both order creation AND stock reduction happen together
    const order = await prisma.$transaction(async (tx) => {
      // Create order
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
      
      // ✅ Reduce stock for each product
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
      
      // ✅ Clear cart
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
});

// Update order status
router.put('/orders/:id/status', authenticateToken, async (req, res) => {
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
});

export default router;