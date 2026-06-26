import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { sendVerificationEmail, generateVerificationToken } from '../services/email.js';
import { registerLimiter, loginLimiter, isValidEmail, isValidPhone, isStrongPassword, sanitizeInput, trackFailedLogin, generateToken, postRegister, postLogin, getMe, getVerifyToken } from "../controllers/authController.js";

const router = Router();
router.post('/register', registerLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().escape(),
  body('lastName').trim().escape(),
  body('phone').trim().escape(),
], postRegister);
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], postLogin);

router.get('/me', getMe);

router.get('/verify/:token', getVerifyToken);

export default router;
