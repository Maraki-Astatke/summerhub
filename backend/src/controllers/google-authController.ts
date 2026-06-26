import dotenv from "dotenv";
import { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
export const getAuthGoogleCallback = async (req: any, res: any) => {
const user = req.user as any;
const userRoles = user.roles?.map((r: any) => r.role.name) || ['student'];
const token = jwt.sign(
  { userId: user.id, email: user.email, role: userRoles[0] },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
);
res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
};
