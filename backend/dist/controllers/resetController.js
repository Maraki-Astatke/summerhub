import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { sendResetEmail } from "../services/email.js";
export const postForgotpassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const user = await prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    await prisma.passwordReset.create({
        data: {
            userId: user.id,
            code: token,
            expiresAt,
            used: false
        }
    });
    await sendResetEmail(email, token);
    res.json({ message: 'Reset link sent to your email' });
};
export const postResetpasswordToken = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { token } = req.params;
    const { password } = req.body;
    const resetRecord = await prisma.passwordReset.findFirst({
        where: {
            code: token,
            used: false,
            expiresAt: { gt: new Date() }
        }
    });
    if (!resetRecord) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword }
        }),
        prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true }
        })
    ]);
    res.json({ message: 'Password reset successful' });
};
