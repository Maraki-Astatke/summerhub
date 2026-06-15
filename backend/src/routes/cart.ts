import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET cart for logged-in user
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    }
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    res.json({
      id: cart.id,
      items: cart.items,
      total,
      itemCount
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// ADD item to cart
router.post('/cart/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID required' });
    }
    
    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stockCount < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      }
    });
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stockCount < newQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }
    
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// UPDATE cart item quantity
router.put('/cart/update', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }
    
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId
      },
      include: { product: true }
    });
    
    if (!cartItem) {
      return res.status(404).json({ error: 'Item not in cart' });
    }
    
    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id }
      });
    } else {
      if (cartItem.product.stockCount < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity }
      });
    }
    
    res.json({ message: 'Cart updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// REMOVE item from cart
router.delete('/cart/remove/:productId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    });
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// CLEAR cart
router.delete('/cart/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });
    
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }
    
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;