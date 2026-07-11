import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { postPaymentInitiateOrderId, getPaymentVerifyTxref, postPaymentWebhook } from "../controllers/paymentController.js";
const router = Router();
router.post('/payment/initiate/:orderId', authenticateToken, postPaymentInitiateOrderId);
router.get('/payment/verify/:tx_ref', getPaymentVerifyTxref);
router.post('/payment/webhook', postPaymentWebhook);
export default router;
