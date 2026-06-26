import { Router, Request, Response } from "express";
import { body, query, param, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import prisma from "../lib/prisma.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
export const eventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many event registrations. Try again later.' }
});
export const postEvents = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { name, description, date, prize, maxParticipants, imageUrl } = req.body;

const event = await prisma.event.create({
  data: {
    name,
    description,
    date: new Date(date),
    prize,
    maxParticipants,
    imageUrl
  }
});

res.status(201).json(event);
};
export const getEvents = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { upcoming, page = 1, limit = 20 } = req.query;
const pageNum = parseInt(page as string);
const limitNum = parseInt(limit as string);
const skip = (pageNum - 1) * limitNum;

const where: any = {};

if (upcoming === 'true') {
  where.date = { gt: new Date() };
}

const [events, total] = await Promise.all([
  prisma.event.findMany({
    where,
    include: {
      registrations: true
    },
    skip,
    take: limitNum,
    orderBy: { date: 'asc' }
  }),
  prisma.event.count({ where })
]);

const eventsWithCount = events.map(e => ({
  ...e,
  registeredCount: e.registrations.length,
  spotsLeft: e.maxParticipants - e.registrations.length
}));

res.json({
  data: eventsWithCount,
  pagination: {
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum)
  }
});
};
export const getEventsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

const event = await prisma.event.findUnique({
  where: { id: parseInt(id) },
  include: {
    registrations: {
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

if (!event) {
  return res.status(404).json({ error: 'Event not found' });
}

const registeredCount = event.registrations.length;
const spotsLeft = event.maxParticipants - registeredCount;

res.json({
  ...event,
  registeredCount,
  spotsLeft
});
};
export const putEventsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { name, description, date, prize, maxParticipants, imageUrl } = req.body;

const existingEvent = await prisma.event.findUnique({
  where: { id: parseInt(id) }
});

if (!existingEvent) {
  return res.status(404).json({ error: 'Event not found' });
}

const updateData: any = {};
if (name) updateData.name = name;
if (description !== undefined) updateData.description = description;
if (date) updateData.date = new Date(date);
if (prize !== undefined) updateData.prize = prize;
if (maxParticipants) updateData.maxParticipants = maxParticipants;
if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

const event = await prisma.event.update({
  where: { id: parseInt(id) },
  data: updateData
});

res.json(event);
};
export const deleteEventsId = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;

await prisma.event.delete({
  where: { id: parseInt(id) }
});

res.status(204).send();
};
export const postEventsIdRegister = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const event = await prisma.event.findUnique({
  where: { id: parseInt(id) },
  include: {
    registrations: true
  }
});

if (!event) {
  return res.status(404).json({ error: 'Event not found' });
}

if (event.date < new Date()) {
  return res.status(400).json({ error: 'Cannot register for past events' });
}

if (event.registrations.length >= event.maxParticipants) {
  return res.status(400).json({ error: 'Event is full' });
}

const existingRegistration = await prisma.eventRegistration.findUnique({
  where: {
    eventId_userId: {
      eventId: parseInt(id),
      userId
    }
  }
});

if (existingRegistration) {
  return res.status(400).json({ error: 'Already registered for this event' });
}

const registration = await prisma.eventRegistration.create({
  data: {
    eventId: parseInt(id),
    userId
  },
  include: {
    event: true,
    user: {
      include: {
        profile: true
      }
    }
  }
});

res.status(201).json(registration);
};
export const deleteEventsIdUnregister = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const userId = req.user.userId;

const event = await prisma.event.findUnique({
  where: { id: parseInt(id) }
});

if (!event) {
  return res.status(404).json({ error: 'Event not found' });
}

if (event.date < new Date()) {
  return res.status(400).json({ error: 'Cannot unregister from past events' });
}

await prisma.eventRegistration.delete({
  where: {
    eventId_userId: {
      eventId: parseInt(id),
      userId
    }
  }
});

res.status(204).send();
};
export const postEventsIdSubmitperformance = async (req: any, res: any) => {
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { id } = req.params;
const { performanceLink } = req.body;
const userId = req.user.userId;

const registration = await prisma.eventRegistration.findUnique({
  where: {
    eventId_userId: {
      eventId: parseInt(id),
      userId
    }
  }
});

if (!registration) {
  return res.status(404).json({ error: 'Not registered for this event' });
}

const updatedRegistration = await prisma.eventRegistration.update({
  where: {
    eventId_userId: {
      eventId: parseInt(id),
      userId
    }
  },
  data: { performanceLink }
});

res.json(updatedRegistration);
};
export const getMyevents = async (req: any, res: any) => {
const userId = req.user.userId;

const registrations = await prisma.eventRegistration.findMany({
  where: { userId },
  include: {
    event: true
  },
  orderBy: {
    event: {
      date: 'asc'
    }
  }
});

const upcomingEvents = registrations.filter(r => r.event.date > new Date());
const pastEvents = registrations.filter(r => r.event.date <= new Date());

res.json({
  upcoming: upcomingEvents,
  past: pastEvents
});
};
