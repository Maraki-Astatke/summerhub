import dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';

const router = Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/auth/google/callback',
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({
      where: { email: profile.emails?.[0].value },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: {
          email: profile.emails?.[0].value,
          password: hashedPassword,
          isVerified: true,
          profile: {
            create: {
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
            }
          }
        },
        include: { roles: { include: { role: true } } }
      });

      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      if (studentRole) {
        await prisma.userRole.create({
          data: { userId: user.id, roleId: studentRole.id }
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    const user = req.user as any;
    const userRoles = user.roles?.map((r: any) => r.role.name) || ['student'];
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: userRoles[0] },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
  }
);

export default router;
