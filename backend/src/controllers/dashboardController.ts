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
  const studentEmail = req.user.email;

  // ✅ AUTO-FIX: Update ALL AI certificates with matching email to this studentId
  try {
      const updated = await prisma.$executeRaw`
          UPDATE "CertifierCertificate" 
          SET "studentId" = ${studentId}
          WHERE "studentEmail" = ${studentEmail}
            AND "studentId" != ${studentId}
      `;
      if (updated > 0) {
          console.log(`✅ Auto-fixed ${updated} certificates with studentId ${studentId}`);
      }
  } catch (fixError) {
      console.log('⚠️ Auto-fix failed (continuing anyway):', fixError);
  }

  // ✅ Get BOTH manual AND AI certificates
  const [manualCerts, aiCerts] = await Promise.all([
      prisma.certificate.findMany({
          where: { studentId: studentId },
          orderBy: { issuedAt: 'desc' },
          include: {
              teacher: { include: { profile: true } },
              template: true
          }
      }),
      prisma.certifierCertificate.findMany({
          where: { OR: [{ studentId: studentId }, { studentEmail: studentEmail }] },
          orderBy: { issuedAt: 'desc' },
          include: {
              issuer: { include: { profile: true } }
          }
      })
  ]);

  // Format manual certificates
  const formattedManual = manualCerts.map((cert: any) => ({
      id: `manual-${cert.id}`,
      title: cert.template?.title || 'Certificate',
      hobby: cert.template?.title || 'Manual Certificate',
      teacher: cert.teacher?.profile?.firstName 
          ? `${cert.teacher.profile.firstName} ${cert.teacher.profile.lastName || ''}`.trim()
          : 'Unknown Teacher',
      issuedAt: cert.issuedAt,
      customMessage: cert.customMessage || null,
      type: 'manual',
      isAI: false,
      displayTitle: cert.template?.title || 'Certificate',
      displayTeacher: cert.teacher?.profile?.firstName 
          ? `${cert.teacher.profile.firstName} ${cert.teacher.profile.lastName || ''}`.trim()
          : 'Unknown Teacher',
      displayHobby: cert.template?.title || 'Manual Certificate'
  }));

  // Format AI certificates
  const formattedAI = aiCerts.map((cert: any) => ({
      id: `ai-${cert.id}`,
      title: `${cert.hobbyName} Certificate`,
      hobby: cert.hobbyName || 'N/A',
      teacher: cert.teacherName || 'AI Generated',
      issuedAt: cert.issuedAt,
      customMessage: `AI-generated certificate for ${cert.hobbyName}`,
      type: 'ai',
      isAI: true,
      credentialId: cert.credentialId,
      displayTitle: `${cert.hobbyName} Certificate`,
      displayTeacher: cert.teacherName || 'AI Generated',
      displayHobby: cert.hobbyName || 'N/A'
  }));

  const allCertificates = [...formattedManual, ...formattedAI]
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());

  console.log(`Found ${allCertificates.length} certificates for student ${studentId}`);
  res.json(allCertificates);
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
