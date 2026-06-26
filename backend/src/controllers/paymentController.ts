import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { initializePayment, verifyPayment } from "../services/payment.js";
export const postPaymentInitiateOrderId = async (req: any, res: any) => {
try {
const { orderId } = req.params;
const userId = req.user.userId;

const order = await prisma.order.findUnique({
  where: { id: parseInt(orderId) },
  include: { user: { include: { profile: true } } }
});

if (!order) {
  return res.status(404).json({ error: 'Order not found' });
}

if (order.userId !== userId) {
  return res.status(403).json({ error: 'Unauthorized' });
}

if (order.status !== 'pending') {
  return res.status(400).json({ error: 'Order already processed' });
}

const payment = await initializePayment(
  order.user.email,
  order.totalAmount,
  order.id,
  order.user.profile?.firstName || 'Customer',
  order.user.profile?.lastName || ''
);

res.json({ checkoutUrl: payment.checkoutUrl, tx_ref: payment.tx_ref });
} catch (error) {
console.error('Payment initiation error:', error);
res.status(500).json({ error: 'Payment initiation failed' });
}
};
export const getPaymentVerifyTxref = async (req: any, res: any) => {
try {
const { tx_ref } = req.params;

const verification = await verifyPayment(tx_ref);

if (verification.data?.status === 'success') {
  const orderId = parseInt(tx_ref.split('-')[1]);
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'paid', paymentId: tx_ref }
  });
  
  res.redirect(`http://localhost:3000/orders/${orderId}?payment=success`);
} else {
  const orderId = parseInt(tx_ref.split('-')[1]);
  res.redirect(`http://localhost:3000/orders/${orderId}?payment=failed`);
}
} catch (error) {
console.error('Payment verification error:', error);
res.redirect(`http://localhost:3000/orders?payment=failed`);
}
};
export const postPaymentWebhook = async (req: any, res: any) => {
try {
const { tx_ref, status } = req.body;

if (status === 'success') {
  const orderId = parseInt(tx_ref.split('-')[1]);
  
  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'paid', paymentId: tx_ref }
  });
}

res.json({ received: true });
} catch (error) {
console.error('Webhook error:', error);
res.status(500).json({ error: 'Webhook failed' });
}
};
