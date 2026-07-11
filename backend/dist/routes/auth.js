import { Router } from 'express';
import { body } from 'express-validator';
import { registerLimiter, loginLimiter, postRegister, postLogin, getMe, getVerifyToken } from "../controllers/authController.js";
const router = Router();
router.post('/register', registerLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().escape(),
    body('lastName').trim().escape(),
    body('phone').trim().escape(),
    body('nationalId').trim().escape(),
], postRegister);
router.post('/login', loginLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
], postLogin);
router.get('/me', getMe);
router.get('/verify/:token', getVerifyToken);
export default router;
