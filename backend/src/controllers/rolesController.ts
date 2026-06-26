import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const getRoles = async (req: any, res: any) => {
const roles = await prisma.role.findMany();
res.json(roles);
};
