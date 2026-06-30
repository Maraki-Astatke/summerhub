import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { sendVerificationEmail, generateVerificationToken } from "../services/email.js";
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many registration attempts. Please try again after an hour.' },
  skipSuccessfulRequests: true,
});
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});
export function isValidEmail(email) {
  const allowedDomains = ['gmail.com', 'yahoo.com', 'icloud.com'];
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  if (!emailRegex.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  return allowedDomains.includes(domain);
}
export function isValidPhone(phone) {
  const phoneRegex = /^(09|07)[0-9]{8}$/;
  return phoneRegex.test(phone);
}
export function isValidNationalId(nationalId) {
  return /^\d{16}$/.test(nationalId);
}
export function isStrongPassword(password) {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true, message: '' };
}
export function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}
export async function trackFailedLogin(email, ipAddress) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success: false,
        attemptedAt: new Date()
      }
    });

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedCount = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        attemptedAt: { gt: fifteenMinutesAgo }
      }
    });

    if (failedCount >= 5) {
      await prisma.user.update({
        where: { email },
        data: { isActive: false }
      });
      console.log(`\ud83d\udd14 Account locked for ${email} due to too many failed attempts`);
    }

    return failedCount;
  }
  return 0;
}
export function generateToken(userId, email, role) {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
export const postRegister = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { email, password, firstName, lastName, phone, nationalId, role = 'student' } = req.body;

    email = sanitizeInput(email).toLowerCase();
    firstName = sanitizeInput(firstName);
    lastName = sanitizeInput(lastName);
    phone = sanitizeInput(phone);
    nationalId = sanitizeInput(nationalId);

    if (!email || !password || !firstName || !lastName || !phone || !nationalId) {
      return res.status(400).json({
        error: 'All fields are required: email, password, firstName, lastName, phone, nationalId'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email domain. Only Gmail, Yahoo, and iCloud emails are allowed.'
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number. Please use Ethiopian format: 09XXXXXXXX or 07XXXXXXXX'
      });
    }

    if (!isValidNationalId(nationalId)) {
      return res.status(400).json({
        error: 'National ID must be exactly 16 digits'
      });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone }
    });

    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const existingNationalId = await prisma.profile.findFirst({
      where: { nationalId }
    });

    if (existingNationalId) {
      return res.status(400).json({ error: 'National ID already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    let roleRecord = await prisma.role.findUnique({
      where: { name: role }
    });

    if (!roleRecord) {
      roleRecord = await prisma.role.create({
        data: { name: role }
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        isVerified: false,
        isActive: false,
        emailVerifications: {
          create: {
            code: verificationToken,
            expiresAt: expiresAt,
            used: false
          }
        },
        profile: {
          create: {
            firstName,
            lastName,
            nationalId,
          }
        },
        roles: {
          create: {
            roleId: roleRecord.id
          }
        }
      },
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`\u2705 Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('\u274C Failed to send email:', emailError);
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully! Please check your email to verify your account.',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const postLogin = async (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { email, password } = req.body;
    email = sanitizeInput(email).toLowerCase();
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      await trackFailedLogin(email, ipAddress);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Your account is pending admin approval or has been deactivated. Please contact support.'
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: 'Please verify your email before logging in. Check your inbox for the verification link.'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await trackFailedLogin(email, ipAddress);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userRoles = user.roles.map(r => r.role.name);
    let primaryRole = 'student';
    if (userRoles.includes('admin')) {
      primaryRole = 'admin';
    } else if (userRoles.includes('teacher')) {
      primaryRole = 'teacher';
    } else if (userRoles.includes('seller')) {
      primaryRole = 'seller';
    } else if (userRoles.includes('scholarship_giver')) {
      primaryRole = 'scholarship_giver';
    } else if (userRoles.includes('parent')) {
      primaryRole = 'parent';
    }

    const token = generateToken(user.id, user.email, primaryRole);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await prisma.loginAttempt.create({
      data: {
        email,
        ipAddress,
        success: true,
        attemptedAt: new Date()
      }
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: userWithoutPassword.id,
        email: userWithoutPassword.email,
        phone: userWithoutPassword.phone,
        isVerified: userWithoutPassword.isVerified,
        profile: userWithoutPassword.profile,
        roles: userRoles
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getMe = async (req: any, res: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userRoles = user.roles.map(r => r.role.name);

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      profile: user.profile,
      roles: userRoles
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};
export const getVerifyToken = async (req: any, res: any) => {
  try {
    const { token } = req.params;

    const verification = await prisma.emailVerification.findFirst({
      where: {
        code: token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!verification) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Verification Failed | HobbyHub</title></head>
        <body style="text-align: center; padding: 50px; font-family: Arial;">
          <h1 style="color: red;">❌ Verification Failed</h1>
          <p>Invalid or expired verification token.</p>
          <a href="http://localhost:3000/register">Go to Register</a>
        </body>
        </html>
      `);
    }

    await prisma.$transaction([
      prisma.emailVerification.update({
        where: { id: verification.id },
        data: { used: true }
      }),
      prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true }
      })
    ]);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified | HobbyHub</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: green; font-size: 48px; }
          h1 { color: #4F46E5; }
          a { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="success">✓</div>
        <h1>Email Verified Successfully!</h1>
        <p>Your account has been verified. You can now log in to HobbyHub.</p>
        <a href="http://localhost:3000/login">Go to Login →</a>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).send('Verification failed. Please try again later.');
  }
};
