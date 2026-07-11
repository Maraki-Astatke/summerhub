import jwt from "jsonwebtoken";
export const getAuthGoogleCallback = async (req, res) => {
    const user = req.user;
    const userRoles = user.roles?.map((r) => r.role.name) || ['student'];
    const token = jwt.sign({ userId: user.id, email: user.email, role: userRoles[0] }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`);
};
