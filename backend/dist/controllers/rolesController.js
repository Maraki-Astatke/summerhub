import prisma from "../lib/prisma.js";
export const getRoles = async (req, res) => {
    const roles = await prisma.role.findMany();
    res.json(roles);
};
