import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const uploadDir = 'uploads/certificates';
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, JPG, and PDF files are allowed'));
    }
  }
});
export const getTeacherStats = async (req: any, res: any) => {
const teacherId = req.user.userId;

const [totalLessons, totalStudents, upcomingLessons, totalRevenue] = await Promise.all([
  prisma.lesson.count({ where: { teacherId } }),
  prisma.lessonRegistration.count({
    where: { lesson: { teacherId } }
  }),
  prisma.lesson.count({
    where: {
      teacherId,
      dateTime: { gt: new Date() }
    }
  }),
  prisma.orderItem.aggregate({
    where: {
      product: {
        sellerId: teacherId
      },
      order: {
        status: 'paid'
      }
    },
    _sum: {
      priceAtTime: true
    }
  })
]);

res.json({
  totalLessons,
  totalStudents,
  upcomingLessons,
  totalRevenue: totalRevenue._sum.priceAtTime || 0
});
};
export const postTeacherLessonsCreate = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { title, description, hobbyId, dateTime, durationMinutes, maxStudents, zoomLink } = req.body;
const teacherId = req.user.userId;

const hobby = await prisma.hobby.findUnique({
  where: { id: hobbyId }
});

if (!hobby) {
  return res.status(400).json({ error: 'Hobby not found' });
}

const lesson = await prisma.lesson.create({
  data: {
    title,
    description,
    teacherId,
    hobbyId,
    dateTime: new Date(dateTime),
    durationMinutes,
    maxStudents,
    zoomLink
  },
  include: {
    teacher: {
      include: {
        profile: true
      }
    },
    hobby: true
  }
});

res.status(201).json(lesson);
};
export const getTeacherLessons = async (req: any, res: any) => {
const teacherId = req.user.userId;

const lessons = await prisma.lesson.findMany({
  where: { teacherId },
  include: {
    hobby: true,
    registrations: {
      include: {
        student: {
          include: {
            profile: true
          }
        }
      }
    }
  },
  orderBy: { dateTime: 'desc' }
});

res.json(lessons);
};
export const getTeacherStudents = async (req: any, res: any) => {
const teacherId = req.user.userId;

const students = await prisma.lessonRegistration.findMany({
  where: {
    lesson: { teacherId }
  },
  include: {
    student: {
      include: {
        profile: true,
        userHobbies: {
          include: {
            hobby: true
          }
        }
      }
    },
    lesson: true
  },
  distinct: ['studentId']
});

const uniqueStudents = students.map(s => ({
  id: s.student.id,
  email: s.student.email,
  profile: s.student.profile,
  hobbies: s.student.userHobbies.map(h => h.hobby.name),
  registeredLessons: s.student.lessonRegistrations?.length || 0
}));

res.json(uniqueStudents);
};
export const getTeacherStudentsStudentId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { studentId } = req.params;
const teacherId = req.user.userId;

const student = await prisma.user.findFirst({
  where: {
    id: parseInt(studentId),
    lessonRegistrations: {
      some: {
        lesson: { teacherId }
      }
    }
  },
  include: {
    profile: true,
    userHobbies: {
      include: {
        hobby: true
      }
    },
    lessonRegistrations: {
      where: {
        lesson: { teacherId }
      },
      include: {
        lesson: true
      }
    }
  }
});

if (!student) {
  return res.status(404).json({ error: 'Student not found' });
}

res.json(student);
};
export const getTeacherLessonsUpcoming = async (req: any, res: any) => {
const teacherId = req.user.userId;

const lessons = await prisma.lesson.findMany({
  where: {
    teacherId,
    dateTime: { gt: new Date() }
  },
  include: {
    hobby: true,
    registrations: {
      include: {
        student: {
          include: {
            profile: true
          }
        }
      }
    }
  },
  orderBy: { dateTime: 'asc' }
});

res.json(lessons);
};
export const postTeacherLessonsIdCancel = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const teacherId = req.user.userId;

const lesson = await prisma.lesson.findFirst({
  where: {
    id: parseInt(id),
    teacherId
  }
});

if (!lesson) {
  return res.status(404).json({ error: 'Lesson not found' });
}

const updatedLesson = await prisma.lesson.update({
  where: { id: parseInt(id) },
  data: { dateTime: new Date(0) }
});

res.json({ message: 'Lesson cancelled', lesson: updatedLesson });
};
export const getTeacherRevenue = async (req: any, res: any) => {
const teacherId = req.user.userId;

const orderItems = await prisma.orderItem.findMany({
  where: {
    product: {
      sellerId: teacherId
    },
    order: {
      status: 'paid'
    }
  },
  include: {
    product: true,
    order: true
  },
  orderBy: {
    order: {
      createdAt: 'desc'
    }
  }
});

const totalRevenue = orderItems.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);

const monthlyRevenue = new Map();

for (const item of orderItems) {
  const month = item.order.createdAt.toISOString().slice(0, 7);
  const amount = item.priceAtTime * item.quantity;
  monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + amount);
}

res.json({
  totalRevenue,
  monthlyRevenue: Array.from(monthlyRevenue.entries()).map(([month, amount]) => ({ month, amount })),
  recentSales: orderItems.slice(0, 20)
});
};
export const postTeacherCertificatesUpload = async (req: any, res: any) => {
try {
  if (!req.file) {
    return res.status(400).json({ error: 'Certificate file is required' });
  }

  const teacherId = req.user.userId;

  await prisma.certificate.deleteMany({
    where: {
      teacherId: teacherId,
      studentId: null,
      templateId: null
    }
  });

  const certificate = await prisma.certificate.create({
    data: {
      teacherId: teacherId,
      issuedAt: new Date(),
      certificateHtml: `/uploads/certificates/${req.file.filename}`,
      customMessage: null
    }
  });

  res.status(201).json({
    id: certificate.id,
    fileUrl: certificate.certificateHtml
  });
} catch (error) {
  console.error('Upload error:', error);
  res.status(500).json({ error: 'Failed to upload certificate' });
}
};
export const postTeacherCertificatesIssue = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

try {
  const { studentId, customMessage } = req.body;
  const teacherId = req.user.userId;

  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      roles: { some: { role: { name: 'student' } } }
    },
    include: { profile: true }
  });

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const template = await prisma.certificate.findFirst({
    where: {
      teacherId: teacherId,
      studentId: null,
      templateId: null
    },
    orderBy: { issuedAt: 'desc' }
  });

  if (!template) {
    return res.status(400).json({ error: 'Please upload a certificate template first' });
  }

  const certificate = await prisma.certificate.create({
    data: {
      studentId: studentId,
      teacherId: teacherId,
      issuedAt: new Date(),
      certificateHtml: template.certificateHtml,
      customMessage: customMessage || null
    },
    include: {
      student: {
        include: { profile: true }
      }
    }
  });

  console.log('Certificate issued:', certificate.id, 'to student:', studentId);

  res.status(201).json(certificate);
} catch (error) {
  console.error('Issue certificate error:', error);
  res.status(500).json({ error: 'Failed to issue certificate', details: error.message });
}
};
export const getTeacherCertificatesIssued = async (req: any, res: any) => {
try {
  const teacherId = req.user.userId;

  const certificates = await prisma.certificate.findMany({
    where: {
      teacherId: teacherId,
      studentId: { not: null }
    },
    include: {
      student: {
        include: { profile: true }
      }
    },
    orderBy: { issuedAt: 'desc' }
  });

  res.json(certificates);
} catch (error) {
  console.error('Error fetching certificates:', error);
  res.status(500).json({ error: 'Failed to fetch certificates' });
}
};
export const getStudentsCertificates = async (req: any, res: any) => {
try {
  const studentId = req.user.userId;

  const certificates = await prisma.certificate.findMany({
    where: {
      studentId: studentId
    },
    orderBy: { issuedAt: 'desc' }
  });

  res.json(certificates);
} catch (error) {
  console.error('Error fetching student certificates:', error);
  res.status(500).json({ error: 'Failed to fetch certificates' });
}
};
export const getCertificatesIdDownload = async (req: any, res: any) => {
try {
  const { id } = req.params;
  const token = req.query.token as string;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    userId = decoded.userId;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const certificate = await prisma.certificate.findFirst({
    where: {
      id: parseInt(id),
      OR: [
        { studentId: userId },
        { teacherId: userId }
      ]
    },
    include: {
      student: { include: { profile: true } }
    }
  });

  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  const filePath = path.join(process.cwd(), certificate.certificateHtml);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Certificate file not found' });
  }
} catch (error) {
  console.error('Error downloading certificate:', error);
  res.status(500).json({ error: 'Failed to download certificate' });
}
};
