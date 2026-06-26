import { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const postNotificationsSendLessonreminder = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { lessonId } = req.params;

const lesson = await prisma.lesson.findUnique({
  where: { id: parseInt(lessonId) },
  include: {
    registrations: {
      include: {
        student: true
      }
    },
    teacher: {
      include: {
        profile: true
      }
    }
  }
});

if (!lesson) {
  return res.status(404).json({ error: 'Lesson not found' });
}

const notifications = [];

for (const reg of lesson.registrations) {
  const reminderLink = `http://localhost:5173/lessons/${lesson.id}`;
  console.log(`Email to ${reg.student.email}: Lesson "${lesson.title}" starts at ${lesson.dateTime}. Join here: ${reminderLink}`);
  notifications.push({ email: reg.student.email, sent: true });
}

res.json({
  message: `Reminders sent to ${notifications.length} students`,
  notifications
});
};
export const postNotificationsSendOrderconfirmation = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { orderId } = req.params;
const userId = req.user.userId;

const order = await prisma.order.findUnique({
  where: { id: parseInt(orderId) },
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
  }
});

if (!order) {
  return res.status(404).json({ error: 'Order not found' });
}

if (order.userId !== userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } }
  });
  const isAdmin = user?.roles.some(r => r.role.name === 'admin');
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
}

const orderLink = `http://localhost:5173/orders/${order.id}`;
console.log(`Email to ${order.user.email}: Order #${order.id} confirmed. Total: ${order.totalAmount} ETB. View: ${orderLink}`);

res.json({ message: 'Order confirmation sent' });
};
export const postNotificationsSendWelcome = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { userId } = req.params;

const user = await prisma.user.findUnique({
  where: { id: parseInt(userId) },
  include: { profile: true }
});

if (!user) {
  return res.status(404).json({ error: 'User not found' });
}

const loginLink = 'http://localhost:5173/login';
console.log(`Welcome email to ${user.email}: Welcome to HobbyHub! Login: ${loginLink}`);

res.json({ message: 'Welcome email sent' });
};
export const postNotificationsSendScholarshipapproved = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { applicationId } = req.params;

const application = await prisma.scholarshipApplication.findUnique({
  where: { id: parseInt(applicationId) },
  include: {
    user: {
      include: {
        profile: true
      }
    },
    scholarship: true
  }
});

if (!application) {
  return res.status(404).json({ error: 'Application not found' });
}

const dashboardLink = 'http://localhost:5173/dashboard';
console.log(`Email to ${application.user.email}: Your scholarship application for ${application.scholarship.name} has been approved! Visit dashboard: ${dashboardLink}`);

res.json({ message: 'Scholarship approval notification sent' });
};
export const postNotificationsSendCertificateearned = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { registrationId } = req.params;
const userId = req.user.userId;

const registration = await prisma.lessonRegistration.findUnique({
  where: { id: parseInt(registrationId) },
  include: {
    student: {
      include: {
        profile: true
      }
    },
    lesson: {
      include: {
        hobby: true
      }
    }
  }
});

if (!registration) {
  return res.status(404).json({ error: 'Registration not found' });
}

if (registration.studentId !== userId) {
  return res.status(403).json({ error: 'Access denied' });
}

const certificateLink = `http://localhost:5173/certificates/${registration.id}`;
console.log(`Email to ${registration.student.email}: Certificate earned for "${registration.lesson.title}"! Download: ${certificateLink}`);

res.json({ message: 'Certificate notification sent' });
};
export const postNotificationsSendEventreminder = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { eventId } = req.params;

const event = await prisma.event.findUnique({
  where: { id: parseInt(eventId) },
  include: {
    registrations: {
      include: {
        user: true
      }
    }
  }
});

if (!event) {
  return res.status(404).json({ error: 'Event not found' });
}

const notifications = [];

for (const reg of event.registrations) {
  const eventLink = `http://localhost:5173/events/${event.id}`;
  console.log(`Email to ${reg.user.email}: Event "${event.name}" starts at ${event.date}. Join here: ${eventLink}`);
  notifications.push({ email: reg.user.email, sent: true });
}

res.json({
  message: `Reminders sent to ${notifications.length} participants`,
  notifications
});
};
export const getNotificationsHistoryUserId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { userId } = req.params;
const currentUserId = req.user.userId;

if (parseInt(userId) !== currentUserId) {
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: { roles: { include: { role: true } } }
  });
  const isAdmin = user?.roles.some(r => r.role.name === 'admin');
  if (!isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
}

const notifications = await prisma.notification.findMany({
  where: { userId: parseInt(userId) },
  orderBy: { createdAt: 'desc' },
  take: 50
});

res.json(notifications);
};
export const putNotificationsIdRead = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const notification = await prisma.notification.findUnique({
  where: { id: parseInt(id) }
});

if (!notification) {
  return res.status(404).json({ error: 'Notification not found' });
}

if (notification.userId !== userId) {
  return res.status(403).json({ error: 'Access denied' });
}

await prisma.notification.update({
  where: { id: parseInt(id) },
  data: { isRead: true }
});

res.json({ message: 'Notification marked as read' });
};
