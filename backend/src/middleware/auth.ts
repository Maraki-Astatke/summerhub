import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
      // Import prisma dynamically or at the top of the file
      // Since it's not imported at the top, we'll import it here or at the top
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.userId },
        include: { role: true }
      });
      
      const roleNames = userRoles.map(ur => ur.role.name);
      
      const hasAllowedRole = allowedRoles.some(role => roleNames.includes(role));
      
      if (!hasAllowedRole) {
        return res.status(403).json({ 
          error: `Forbidden. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role || 'undefined'}` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ error: 'Internal server error while verifying roles' });
    }
  };
}

export function requireOwnershipOrAdmin(getResourceUserId: (req: AuthRequest) => Promise<number | null>) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const isAdmin = req.user.role === 'admin';
    
    if (isAdmin) {
      return next();
    }
    
    const resourceUserId = await getResourceUserId(req);
    if (resourceUserId === req.user.userId) {
      return next();
    }
    
    return res.status(403).json({ error: 'Forbidden. You can only access your own data.' });
  };
}