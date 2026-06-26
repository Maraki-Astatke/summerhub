import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const getDashboardStats = async (req: any, res: any) => {
const userId = req.user.userId;

const [quizResult, registeredLessons, userHobbies, blogPosts, orderCount] = await Promise.all([
  prisma.quizResult.findFirst({
    where: { userId }
  }),
  prisma.lessonRegistration.count({
    where: { studentId: userId }
  }),
  prisma.userHobby.count({
    where: { userId }
  }),
  prisma.blogPost.count({
    where: { authorId: userId }
  }),
  prisma.order.count({
    where: { userId }
  })
]);

res.json({
  hasTakenQuiz: !!quizResult,
  registeredLessons,
  hobbiesDiscovered: userHobbies,
  blogPostsWritten: blogPosts,
  ordersPlaced: orderCount
});
};
export const getDashboardProgress = async (req: any, res: any) => {
const userId = req.user.userId;

const quizResult = await prisma.quizResult.findFirst({
  where: { userId },
  include: {
    user: {
      include: {
        profile: true
      }
    }
  }
});

const attendedLessons = await prisma.lessonRegistration.count({
  where: {
    studentId: userId,
    attended: true
  }
});

const userHobbies = await prisma.userHobby.findMany({
  where: { userId },
  include: {
    hobby: {
      include: {
        category: true
      }
    }
  },
  orderBy: {
    interestLevel: 'desc'
  }
});

res.json({
  quizCompleted: !!quizResult,
  quizCompletedAt: quizResult?.completedAt,
  attendedLessons,
  topHobbies: userHobbies.slice(0, 3),
  allHobbies: userHobbies
});
};
export const getDashboardCertificates = async (req: any, res: any) => {
try {
  const studentId = req.user.userId;

  const certificates = await prisma.certificate.findMany({
    where: {
      studentId: studentId
    },
    include: {
      teacher: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  });

  const formattedCertificates = certificates.map(cert => ({
    id: cert.id,
    title: 'Certificate of Completion',
    hobby: 'Course Completion',
    teacher: cert.teacher?.profile?.firstName 
      ? `${cert.teacher.profile.firstName} ${cert.teacher.profile.lastName || ''}`
      : 'HobbyHub Instructor',
    issuedAt: cert.issuedAt,
    fileUrl: cert.certificateHtml,
    customMessage: cert.customMessage
  }));

  console.log(`Found ${formattedCertificates.length} certificates for student ${studentId}`);
  res.json(formattedCertificates);
} catch (error) {
  console.error('Error fetching certificates:', error);
  res.status(500).json({ error: 'Failed to fetch certificates' });
}
};
export const getDashboardAchievements = async (req: any, res: any) => {
const userId = req.user.userId;

const [quizResult, attendedCount, blogCount, orderCount, hobbyCount] = await Promise.all([
  prisma.quizResult.findFirst({ where: { userId } }),
  prisma.lessonRegistration.count({ where: { studentId: userId, attended: true } }),
  prisma.blogPost.count({ where: { authorId: userId } }),
  prisma.order.count({ where: { userId } }),
  prisma.userHobby.count({ where: { userId } })
]);

const achievements = [];

if (quizResult) {
  achievements.push({ name: 'Quiz Master', description: 'Completed the interest quiz', earned: true });
}

if (attendedCount >= 1) {
  achievements.push({ name: 'First Lesson', description: 'Attended first lesson', earned: true });
}

if (attendedCount >= 5) {
  achievements.push({ name: 'Dedicated Learner', description: 'Attended 5 lessons', earned: true });
}

if (hobbyCount >= 3) {
  achievements.push({ name: 'Hobby Explorer', description: 'Discovered 3 hobbies', earned: true });
}

if (blogCount >= 1) {
  achievements.push({ name: 'First Blog', description: 'Published first blog post', earned: true });
}

if (orderCount >= 1) {
  achievements.push({ name: 'First Purchase', description: 'Made first marketplace purchase', earned: true });
}

res.json(achievements);
};
export const putProfile = async (req: any, res: any) => {
const userId = req.user.userId;
const { firstName, lastName, age, grade, city, schoolName, avatarUrl, bio } = req.body;

const profile = await prisma.profile.update({
  where: { userId },
  data: {
    firstName,
    lastName,
    age,
    grade,
    city,
    schoolName,
    avatarUrl,
    bio
  }
});

res.json(profile);
};
export const getProfile = async (req: any, res: any) => {
const userId = req.user.userId;

const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profile: true,
    roles: {
      include: {
        role: true
      }
    }
  }
});

const { password, ...userWithoutPassword } = user;

res.json(userWithoutPassword);
};
