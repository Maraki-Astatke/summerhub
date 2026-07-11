import { validationResult } from "express-validator";
import prisma from "../lib/prisma.js";
export const getAdminQuizQuestions = async (req, res) => {
    try {
        const questions = await prisma.quizQuestion.findMany({
            orderBy: { createdAt: 'asc' }
        });
        res.json(questions);
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
};
export const postAdminQuizQuestions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { question } = req.body;
        const quizQuestion = await prisma.quizQuestion.create({
            data: {
                question,
                options: [],
                isActive: true
            }
        });
        res.status(201).json(quizQuestion);
    }
    catch (error) {
        console.error('Error creating question:', error);
        res.status(500).json({ error: 'Failed to create question' });
    }
};
export const putAdminQuizQuestionsId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        const { question } = req.body;
        const quizQuestion = await prisma.quizQuestion.update({
            where: { id: parseInt(id) },
            data: { question }
        });
        res.json(quizQuestion);
    }
    catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ error: 'Failed to update question' });
    }
};
export const deleteAdminQuizQuestionsId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        await prisma.quizQuestion.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ error: 'Failed to delete question' });
    }
};
export const getAdminQuizresponsesStudentStudentId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { studentId } = req.params;
        const student = await prisma.user.findFirst({
            where: {
                id: parseInt(studentId),
                roles: {
                    some: {
                        role: {
                            name: 'student'
                        }
                    }
                }
            },
            include: {
                profile: true,
                quizAnswers: {
                    include: {
                        question: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                receivedRecommendations: {
                    include: {
                        hobby: {
                            include: {
                                category: true
                            }
                        },
                        admin: {
                            include: {
                                profile: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const formattedAnswers = student.quizAnswers.map(answer => ({
            id: answer.id,
            questionId: answer.questionId,
            questionText: answer.question?.question || 'Unknown Question',
            answerText: answer.answerText || 'No answer provided',
            createdAt: answer.createdAt
        }));
        const response = {
            id: student.id,
            email: student.email,
            profile: student.profile,
            quizAnswers: formattedAnswers,
            recommendations: student.receivedRecommendations,
            totalAnswers: formattedAnswers.length,
            totalRecommendations: student.receivedRecommendations.length,
            hasTakenQuiz: formattedAnswers.length > 0
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
};
export const getAdminQuizresponses = async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: 'student'
                        }
                    }
                }
            },
            include: {
                profile: true,
                quizAnswers: {
                    include: {
                        question: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                },
                receivedRecommendations: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const formattedStudents = students.map(student => {
            const hasQuizAnswers = student.quizAnswers && student.quizAnswers.length > 0;
            return {
                id: student.id,
                email: student.email,
                profile: student.profile,
                quizAnswers: student.quizAnswers.map(answer => ({
                    id: answer.id,
                    questionId: answer.questionId,
                    questionText: answer.question?.question,
                    answerText: answer.answerText,
                    createdAt: answer.createdAt
                })),
                totalAnswers: student.quizAnswers.length,
                recommendationsCount: student.receivedRecommendations.length,
                hasTakenQuiz: hasQuizAnswers,
                lastActive: student.updatedAt
            };
        });
        res.json(formattedStudents);
    }
    catch (error) {
        console.error('Error fetching quiz responses:', error);
        res.status(500).json({ error: 'Failed to fetch quiz responses' });
    }
};
export const postAdminQuizresponsesStudentIdRecommend = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { studentId } = req.params;
        const { hobbyId, reason } = req.body;
        const adminId = req.user.userId;
        const student = await prisma.user.findFirst({
            where: {
                id: parseInt(studentId),
                roles: {
                    some: {
                        role: {
                            name: 'student'
                        }
                    }
                }
            }
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        const hobby = await prisma.hobby.findUnique({
            where: { id: hobbyId },
            include: { category: true }
        });
        if (!hobby) {
            return res.status(404).json({ error: 'Hobby not found' });
        }
        const recommendation = await prisma.studentRecommendation.create({
            data: {
                studentId: parseInt(studentId),
                adminId: adminId,
                hobbyId: hobbyId,
                reason: reason || null,
                isRead: false
            },
            include: {
                hobby: { include: { category: true } },
                admin: { include: { profile: true } }
            }
        });
        console.log('Recommendation created:', recommendation);
        res.status(201).json({
            message: 'Recommendation sent successfully',
            recommendation
        });
    }
    catch (error) {
        console.error('Error creating recommendation:', error);
        res.status(500).json({ error: 'Failed to create recommendation' });
    }
};
export const getAdminHobbieslist = async (req, res) => {
    try {
        const hobbies = await prisma.hobby.findMany({
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        res.json(hobbies);
    }
    catch (error) {
        console.error('Error fetching hobbies:', error);
        res.status(500).json({ error: 'Failed to fetch hobbies' });
    }
};
export const getAdminQuizsummary = async (req, res) => {
    try {
        const totalStudents = await prisma.user.count({
            where: {
                roles: {
                    some: {
                        role: {
                            name: 'student'
                        }
                    }
                }
            }
        });
        const studentsWithQuiz = await prisma.user.count({
            where: {
                roles: {
                    some: {
                        role: {
                            name: 'student'
                        }
                    }
                },
                quizAnswers: {
                    some: {}
                }
            }
        });
        const studentsWithoutQuiz = totalStudents - studentsWithQuiz;
        const totalRecommendations = await prisma.studentRecommendation.count();
        const summary = {
            totalStudents: totalStudents,
            studentsWithQuiz: studentsWithQuiz,
            studentsWithoutQuiz: studentsWithoutQuiz,
            totalRecommendations: totalRecommendations,
            averageQuizCompletion: totalStudents > 0 ? Math.round((studentsWithQuiz / totalStudents) * 100) : 0
        };
        res.json(summary);
    }
    catch (error) {
        console.error('Error fetching quiz summary:', error);
        res.status(500).json({ error: 'Failed to fetch quiz summary' });
    }
};
export const deleteAdminRecommendationsRecommendationId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { recommendationId } = req.params;
        await prisma.studentRecommendation.delete({
            where: { id: parseInt(recommendationId) }
        });
        res.json({ message: 'Recommendation deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting recommendation:', error);
        res.status(500).json({ error: 'Failed to delete recommendation' });
    }
};
