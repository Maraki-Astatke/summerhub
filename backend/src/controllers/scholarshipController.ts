import { Router, Request, Response } from "express";
import { body, query, param, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const scholarshipLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many scholarship applications. Try again later.' }
});
export const postScholarships = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { name, description, amount, requirements, deadline } = req.body;

const scholarship = await prisma.scholarship.create({
  data: {
    name,
    description,
    amount,
    requirements,
    deadline: new Date(deadline)
  }
});

res.status(201).json(scholarship);
};
export const getScholarships = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { active, page = 1, limit = 20 } = req.query;
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;

const where: any = {};

if (active === 'true') {
  where.deadline = { gt: new Date() };
}

const [scholarships, total] = await Promise.all([
  prisma.scholarship.findMany({
    where,
    include: {
      applications: true
    },
    skip,
    take: limitNum,
    orderBy: { deadline: 'asc' }
  }),
  prisma.scholarship.count({ where })
]);

const scholarshipsWithCount = scholarships.map(s => ({
  ...s,
  applicationCount: s.applications.length
}));

res.json({
  data: scholarshipsWithCount,
  pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  }
});
};
export const getScholarshipsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const scholarship = await prisma.scholarship.findUnique({
  where: { id: parseInt(id) },
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

if (!scholarship) {
  return res.status(404).json({ error: 'Scholarship not found' });
}

res.json(scholarship);
};
export const putScholarshipsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { name, description, amount, requirements, deadline } = req.body;

const existingScholarship = await prisma.scholarship.findUnique({
  where: { id: parseInt(id) }
});

if (!existingScholarship) {
  return res.status(404).json({ error: 'Scholarship not found' });
}

const updateData: any = {};
if (name) updateData.name = name;
if (description !== undefined) updateData.description = description;
if (amount) updateData.amount = amount;
if (requirements !== undefined) updateData.requirements = requirements;
if (deadline) updateData.deadline = new Date(deadline);

const scholarship = await prisma.scholarship.update({
  where: { id: parseInt(id) },
  data: updateData
});

res.json(scholarship);
};
export const deleteScholarshipsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

await prisma.scholarship.delete({
  where: { id: parseInt(id) }
});

res.status(204).send();
};
export const postScholarshipsIdApply = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { essayText } = req.body;
const userId = req.user.userId;

const scholarship = await prisma.scholarship.findUnique({
  where: { id: parseInt(id) }
});

if (!scholarship) {
  return res.status(404).json({ error: 'Scholarship not found' });
}

if (scholarship.deadline < new Date()) {
  return res.status(400).json({ error: 'Scholarship deadline has passed' });
}

const existingApplication = await prisma.scholarshipApplication.findUnique({
  where: {
    scholarshipId_userId: {
      scholarshipId: parseInt(id),
      userId
    }
  }
});

if (existingApplication) {
  return res.status(400).json({ error: 'Already applied for this scholarship' });
}

const application = await prisma.scholarshipApplication.create({
  data: {
    scholarshipId: parseInt(id),
    userId,
    essayText,
    status: 'pending'
  },
  include: {
    user: {
      include: {
        profile: true
      }
    },
    scholarship: true
  }
});

res.status(201).json(application);
};
export const getScholarshipsApplications = async (req: any, res: any) => {
const applications = await prisma.scholarshipApplication.findMany({
  include: {
    user: {
      include: {
        profile: true
      }
    },
    scholarship: true
  },
  orderBy: { appliedAt: 'desc' }
});

res.json(applications);
};
export const putScholarshipsApplicationsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { status } = req.body;

const application = await prisma.scholarshipApplication.findUnique({
  where: { id: parseInt(id) },
  include: {
    user: true,
    scholarship: true
  }
});

if (!application) {
  return res.status(404).json({ error: 'Application not found' });
}

const updatedApplication = await prisma.scholarshipApplication.update({
  where: { id: parseInt(id) },
  data: { status },
  include: {
    user: {
      include: {
        profile: true
      }
    },
    scholarship: true
  }
});

if (status === 'approved') {
  const existingScholarRole = await prisma.userRole.findFirst({
    where: {
      userId: application.userId,
      role: { name: 'scholar' }
    }
  });

  if (!existingScholarRole) {
    const scholarRole = await prisma.role.findUnique({
      where: { name: 'scholar' }
    });

    if (scholarRole) {
      await prisma.userRole.create({
        data: {
          userId: application.userId,
          roleId: scholarRole.id
        }
      });
    }
  }
}

res.json(updatedApplication);
};
export const getMyapplications = async (req: any, res: any) => {
const userId = req.user.userId;

const applications = await prisma.scholarshipApplication.findMany({
  where: { userId },
  include: {
    scholarship: true
  },
  orderBy: { appliedAt: 'desc' }
});

res.json(applications);
};
