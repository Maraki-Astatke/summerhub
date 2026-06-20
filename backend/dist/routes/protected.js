"use strict";
// import { Router } from 'express';
// import { authenticateToken, requireRole } from '../middleware/auth.js';
// import prisma from '../lib/prisma.js';
// const router = Router();
// // ============================================
// // PUBLIC ROUTES (no authentication needed)
// // ============================================
// router.get('/hobbies', async (req, res) => {
//   const hobbies = await prisma.hobby.findMany();
//   res.json(hobbies);
// });
// // ============================================
// // STUDENT ROUTES (student, scholar, parent can access)
// // ============================================
// router.get('/student/dashboard', 
//   authenticateToken, 
//   requireRole(['student', 'scholar', 'parent', 'admin']),
//   async (req, res) => {
//     res.json({ message: 'Student Dashboard', user: req.user });
//   }
// );
// router.post('/student/quiz/submit', 
//   authenticateToken, 
//   requireRole(['student', 'scholar']),
//   async (req, res) => {
//     res.json({ message: 'Quiz submitted!' });
//   }
// );
// // ============================================
// // SCHOLARSHIP GIVER ROUTES
// // ============================================
// router.post('/scholarships/create', 
//   authenticateToken, 
//   requireRole(['scholarship_giver', 'admin']),
//   async (req, res) => {
//     const { name, description, amount, deadline } = req.body;
//     const scholarship = await prisma.scholarship.create({
//       data: {
//         name,
//         description,
//         amount,
//         deadline: new Date(deadline),
//         createdBy: req.user!.id
//       }
//     });
//     res.json({ message: 'Scholarship created!', scholarship });
//   }
// );
// router.get('/scholarships/applications', 
//   authenticateToken, 
//   requireRole(['scholarship_giver', 'admin']),
//   async (req, res) => {
//     const applications = await prisma.scholarshipApplication.findMany({
//       include: {
//         user: {
//           include: {
//             profile: true
//           }
//         },
//         scholarship: true
//       }
//     });
//     res.json(applications);
//   }
// );
// router.put('/scholarships/applications/:id/approve', 
//   authenticateToken, 
//   requireRole(['scholarship_giver', 'admin']),
//   async (req, res) => {
//     const { id } = req.params;
//     const application = await prisma.scholarshipApplication.update({
//       where: { id: parseInt(id) },
//       data: { status: 'approved' }
//     });
//     res.json({ message: 'Application approved!', application });
//   }
// );
// // ============================================
// // TEACHER ROUTES
// // ============================================
// router.post('/lessons/create', 
//   authenticateToken, 
//   requireRole(['teacher', 'admin']),
//   async (req, res) => {
//     const { title, description, hobbyId, dateTime, durationMinutes, maxStudents } = req.body;
//     const lesson = await prisma.lesson.create({
//       data: {
//         title,
//         description,
//         teacherId: req.user!.id,
//         hobbyId,
//         dateTime: new Date(dateTime),
//         durationMinutes,
//         maxStudents
//       }
//     });
//     res.json({ message: 'Lesson created!', lesson });
//   }
// );
// router.get('/teacher/students', 
//   authenticateToken, 
//   requireRole(['teacher', 'admin']),
//   async (req, res) => {
//     const students = await prisma.lessonRegistration.findMany({
//       where: {
//         lesson: {
//           teacherId: req.user!.id
//         }
//       },
//       include: {
//         student: {
//           include: {
//             profile: true
//           }
//         }
//       }
//     });
//     res.json(students);
//   }
// );
// // ============================================
// // SELLER ROUTES
// // ============================================
// router.post('/products/create', 
//   authenticateToken, 
//   requireRole(['seller', 'admin']),
//   async (req, res) => {
//     const { name, description, price, stockCount, categoryId } = req.body;
//     const product = await prisma.product.create({
//       data: {
//         name,
//         description,
//         price,
//         stockCount,
//         categoryId,
//         sellerId: req.user!.id
//       }
//     });
//     res.json({ message: 'Product listed!', product });
//   }
// );
// router.get('/seller/orders', 
//   authenticateToken, 
//   requireRole(['seller', 'admin']),
//   async (req, res) => {
//     const orders = await prisma.orderItem.findMany({
//       where: {
//         product: {
//           sellerId: req.user!.id
//         }
//       },
//       include: {
//         order: {
//           include: {
//             user: {
//               include: {
//                 profile: true
//               }
//             }
//           }
//         },
//         product: true
//       }
//     });
//     res.json(orders);
//   }
// );
// // ============================================
// // PARENT ROUTES
// // ============================================
// router.get('/parent/children', 
//   authenticateToken, 
//   requireRole(['parent', 'admin']),
//   async (req, res) => {
//     // Assuming you have a Child table linked to Parent
//     // This is a placeholder - you'll need to create a Child model
//     res.json({ message: 'List of children under parent' });
//   }
// );
// router.post('/parent/approve-purchase/:orderId', 
//   authenticateToken, 
//   requireRole(['parent', 'admin']),
//   async (req, res) => {
//     const { orderId } = req.params;
//     const order = await prisma.order.update({
//       where: { id: parseInt(orderId) },
//       data: { status: 'approved_by_parent' }
//     });
//     res.json({ message: 'Purchase approved!', order });
//   }
// );
// // ============================================
// // ADMIN ROUTES (only admin)
// // ============================================
// router.get('/admin/users', 
//   authenticateToken, 
//   requireRole(['admin']),
//   async (req, res) => {
//     const users = await prisma.user.findMany({
//       include: {
//         profile: true,
//         roles: {
//           include: {
//             role: true
//           }
//         }
//       }
//     });
//     res.json(users);
//   }
// );
// router.put('/admin/users/:id/roles', 
//   authenticateToken, 
//   requireRole(['admin']),
//   async (req, res) => {
//     const { id } = req.params;
//     const { roleIds } = req.body;
//     // Remove existing roles
//     await prisma.userRole.deleteMany({
//       where: { userId: parseInt(id) }
//     });
//     // Add new roles
//     const userRoles = roleIds.map((roleId: number) => ({
//       userId: parseInt(id),
//       roleId
//     }));
//     await prisma.userRole.createMany({
//       data: userRoles
//     });
//     res.json({ message: 'User roles updated!' });
//   }
// );
// export default router;
