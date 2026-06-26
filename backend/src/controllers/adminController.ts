import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const getAdminStats = async (req: any, res: any) => {
const [totalUsers, totalStudents, totalTeachers, totalSellers, totalProducts, totalLessons, totalOrders, totalRevenue] = await Promise.all([
prisma.user.count(),
prisma.user.count({
  where: { roles: { some: { role: { name: 'student' } } } }
}),
prisma.user.count({
  where: { roles: { some: { role: { name: 'teacher' } } } }
}),
prisma.user.count({
  where: { roles: { some: { role: { name: 'seller' } } } }
}),
prisma.product.count(),
prisma.lesson.count(),
prisma.order.count(),
prisma.orderItem.aggregate({
  where: { order: { status: 'paid' } },
  _sum: { priceAtTime: true }
})
]);

res.json({
totalUsers,
totalStudents,
totalTeachers,
totalSellers,
totalProducts,
totalLessons,
totalOrders,
totalRevenue: totalRevenue._sum.priceAtTime || 0
});
};
export const getAdminUsers = async (req: any, res: any) => {
const { role, isVerified, page = 1, limit = 20 } = req.query;
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;

const where: any = {};

if (role) {
where.roles = { some: { role: { name: role as string } } };
}

if (isVerified === 'true') {
where.isVerified = true;
} else if (isVerified === 'false') {
where.isVerified = false;
}

const [users, total] = await Promise.all([
prisma.user.findMany({
  where,
  include: {
    profile: true,
    roles: {
      include: {
        role: true
      }
    }
  },
  skip,
  take: limitNum,
  orderBy: { createdAt: 'desc' }
}),
prisma.user.count({ where })
]);

const usersWithoutPassword = users.map(({ password, ...user }) => user);

res.json({
data: usersWithoutPassword,
pagination: {
  page: pageNum,
  limit: limitNum,
  total,
  pages: Math.ceil(total / limitNum)
}
});
};
export const getAdminUsersId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const user = await prisma.user.findUnique({
  where: { id: parseInt(id) },
  include: {
    profile: true,
    roles: {
      include: {
        role: true
      }
    },
    userHobbies: {
      include: {
        hobby: true
      }
    },
    lessonRegistrations: {
      include: {
        lesson: true
      }
    },
    orders: {
      include: {
        items: true
      }
    }
  }
});

if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

const { password, ...userWithoutPassword } = user;

res.json(userWithoutPassword);
};
export const putAdminUsersIdRoles = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { roleIds } = req.body;

await prisma.userRole.deleteMany({
  where: { userId: parseInt(id) }
});

const userRoles = roleIds.map((roleId: number) => ({
  userId: parseInt(id),
  roleId,
  assignedAt: new Date()
}));

await prisma.userRole.createMany({
  data: userRoles
});

res.json({ message: 'User roles updated' });
};
export const putAdminUsersIdActivate = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const user = await prisma.user.update({
  where: { id: parseInt(id) },
  data: { isActive: true }
});

res.json({ message: 'User activated', user: { id: user.id, email: user.email, isActive: user.isActive } });
};
export const putAdminUsersIdDeactivate = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const user = await prisma.user.update({
  where: { id: parseInt(id) },
  data: { isActive: false }
});

res.json({ message: 'User deactivated', user: { id: user.id, email: user.email, isActive: user.isActive } });
};
export const deleteAdminUsersId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

await prisma.user.delete({
  where: { id: parseInt(id) }
});

res.status(204).send();
};
export const getAdminReportsSales = async (req: any, res: any) => {
const orders = await prisma.order.findMany({
where: { status: 'paid' },
include: {
  user: {
    include: {
      profile: true
    }
  },
  items: {
    include: {
      product: true
    }
  }
},
orderBy: { createdAt: 'desc' },
take: 100
});

const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);

res.json({
totalSales,
orderCount: orders.length,
orders
});
};
export const getAdminReportsLessons = async (req: any, res: any) => {
const lessons = await prisma.lesson.findMany({
include: {
  teacher: {
    include: {
      profile: true
    }
  },
  hobby: true,
  registrations: true
},
orderBy: { createdAt: 'desc' },
take: 100
});

const totalRegistrations = lessons.reduce((sum, lesson) => sum + lesson.registrations.length, 0);

res.json({
totalLessons: lessons.length,
totalRegistrations,
lessons
});
};
export const getAdminReportsScholarships = async (req: any, res: any) => {
const scholarships = await prisma.scholarship.findMany({
include: {
  applications: {
    include: {
      user: {
        include: {
          profile: true
        }
      }
    }
  }
}
});

const totalApplications = scholarships.reduce((sum, s) => sum + s.applications.length, 0);
const approvedApplications = scholarships.reduce((sum, s) => sum + s.applications.filter(a => a.status === 'approved').length, 0);

res.json({
totalScholarships: scholarships.length,
totalApplications,
approvedApplications,
scholarships
});
};
export const postAdminCategories = async (req: any, res: any) => {
const { name, description } = req.body;

const category = await prisma.hobbyCategory.create({
data: { name, description }
});

res.status(201).json(category);
};
export const getAdminCategories = async (req: any, res: any) => {
const categories = await prisma.hobbyCategory.findMany({
include: { hobbies: true }
});
res.json(categories);
};
export const putAdminCategoriesId = async (req: any, res: any) => {
const { id } = req.params;
const { name, description } = req.body;

const category = await prisma.hobbyCategory.update({
where: { id: parseInt(id) },
data: { name, description }
});
res.json(category);
};
export const deleteAdminCategoriesId = async (req: any, res: any) => {
const { id } = req.params;
await prisma.hobbyCategory.delete({ where: { id: parseInt(id) } });
res.status(204).send();
};
export const postAdminHobbies = async (req: any, res: any) => {
const { name, description, ageGroup, categoryId, imageUrl } = req.body;

const hobby = await prisma.hobby.create({
data: { name, description, ageGroup, categoryId, imageUrl }
});
res.status(201).json(hobby);
};
export const putAdminHobbiesId = async (req: any, res: any) => {
const { id } = req.params;
const { name, description, ageGroup, categoryId, imageUrl } = req.body;

const hobby = await prisma.hobby.update({
where: { id: parseInt(id) },
data: { name, description, ageGroup, categoryId, imageUrl }
});
res.json(hobby);
};
export const deleteAdminHobbiesId = async (req: any, res: any) => {
const { id } = req.params;
await prisma.hobby.delete({ where: { id: parseInt(id) } });
res.status(204).send();
};
export const postAdminProductcategories = async (req: any, res: any) => {
const { name, description } = req.body;

const category = await prisma.productCategory.create({
data: { name, description }
});

res.status(201).json(category);
};
export const getAdminProductcategories = async (req: any, res: any) => {
const categories = await prisma.productCategory.findMany();
res.json(categories);
};
export const putAdminProductcategoriesId = async (req: any, res: any) => {
const { id } = req.params;
const { name, description } = req.body;

const category = await prisma.productCategory.update({
where: { id: parseInt(id) },
data: { name, description }
});
res.json(category);
};
export const deleteAdminProductcategoriesId = async (req: any, res: any) => {
const { id } = req.params;
await prisma.productCategory.delete({ where: { id: parseInt(id) } });
res.status(204).send();
};
