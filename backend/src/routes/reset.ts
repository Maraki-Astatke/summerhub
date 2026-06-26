import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { sendResetEmail } from '../services/email.js';
import { postForgotpassword, postResetpasswordToken } from "../controllers/resetController.js";

const router = Router();

router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail()
  ], postForgotpassword
);

router.post('/reset-password/:token',
  [
    body('password').isLength({ min: 8 })
  ], postResetpasswordToken
);

export default router;
