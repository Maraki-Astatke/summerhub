import { Router } from 'express';
import { body } from 'express-validator';
import { postForgotpassword, postResetpasswordToken } from "../controllers/resetController.js";
const router = Router();
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail()
], postForgotpassword);
router.post('/reset-password/:token', [
    body('password').isLength({ min: 8 })
], postResetpasswordToken);
export default router;
