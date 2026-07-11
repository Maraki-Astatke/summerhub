import prisma from '../lib/prisma.js';
// Get all sponsorships by the logged-in scholar giver
export const getSponsorships = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const sponsorships = await prisma.eventSponsorship.findMany({
            where: { giverId },
            include: {
                event: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sponsorships);
    }
    catch (error) {
        console.error('Error fetching sponsorships:', error);
        res.status(500).json({ error: 'Failed to fetch sponsorships' });
    }
};
// Sponsor an event
export const sponsorEvent = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const eventId = parseInt(req.params.eventId);
        const { amount, sponsorType, message } = req.body;
        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        const event = await prisma.eventPost.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Upsert or create new sponsorship
        const sponsorship = await prisma.eventSponsorship.upsert({
            where: {
                eventId_giverId: { eventId, giverId },
            },
            update: {
                amount: parseFloat(amount),
                sponsorType: sponsorType || 'financial',
                message: message || '',
                status: 'pending', // reset to pending if updating
            },
            create: {
                eventId,
                giverId,
                amount: parseFloat(amount),
                sponsorType: sponsorType || 'financial',
                message: message || '',
                status: 'pending',
            },
        });
        res.status(201).json(sponsorship);
    }
    catch (error) {
        console.error('Error sponsoring event:', error);
        res.status(500).json({ error: 'Failed to sponsor event' });
    }
};
// Get jobs posted by the scholar giver
export const getMyJobs = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const jobs = await prisma.job.findMany({
            where: { giverId },
            include: {
                applications: {
                    include: {
                        student: {
                            include: { profile: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};
// Create a job post (pending admin approval)
export const createJob = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, description, hobbyCategory, jobType, location, payment, paymentType, requirements, experienceLevel, positionsAvailable, applicationDeadline, } = req.body;
        if (!title || !description || !hobbyCategory || !payment || !applicationDeadline) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }
        const job = await prisma.job.create({
            data: {
                title,
                description,
                hobbyCategory,
                jobType: jobType || 'part-time',
                location: location || 'remote',
                payment: parseFloat(payment),
                paymentType: paymentType || 'one-time',
                requirements: requirements || '',
                experienceLevel: experienceLevel || 'any',
                positionsAvailable: parseInt(positionsAvailable) || 1,
                applicationDeadline: new Date(applicationDeadline),
                status: 'pending',
                giverId,
            },
        });
        res.status(201).json(job);
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to post job' });
    }
};
// Delete job post
export const deleteJob = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const jobId = parseInt(req.params.id);
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (job.giverId !== giverId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Not your job post.' });
        }
        await prisma.job.delete({
            where: { id: jobId },
        });
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting job:', error);
        res.status(500).json({ error: 'Failed to delete job' });
    }
};
// Get job applications for giver's posted jobs
export const getJobApplications = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const applications = await prisma.jobApplication.findMany({
            where: {
                job: {
                    giverId,
                },
            },
            include: {
                job: true,
                student: {
                    include: {
                        profile: true,
                    },
                },
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applications);
    }
    catch (error) {
        console.error('Error fetching job applications:', error);
        res.status(500).json({ error: 'Failed to fetch job applications' });
    }
};
// Update job application status
export const updateJobApplication = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const applicationId = parseInt(req.params.id);
        const { status } = req.body; // shortlisted, hired, rejected
        if (!['shortlisted', 'hired', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid application status' });
        }
        const application = await prisma.jobApplication.findUnique({
            where: { id: applicationId },
            include: { job: true },
        });
        if (!application) {
            return res.status(404).json({ error: 'Job application not found' });
        }
        if (application.job.giverId !== giverId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const updatedApp = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status },
            include: {
                job: true,
                student: {
                    include: { profile: true },
                },
            },
        });
        res.json(updatedApp);
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Failed to update job application' });
    }
};
// Get students for talent discovery
export const getStudents = async (req, res) => {
    try {
        // Find all users who have 'student' or 'scholar' roles
        const students = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: {
                            name: {
                                in: ['student', 'scholar'],
                            },
                        },
                    },
                },
            },
            include: {
                profile: true,
                userHobbies: {
                    include: {
                        hobby: true,
                    },
                },
            },
        });
        // Format output to match frontend expected fields
        const formattedStudents = students.map((s) => ({
            id: s.id,
            email: s.email,
            profile: s.profile,
            hobbies: s.userHobbies.map((uh) => ({
                id: uh.hobby.id,
                name: uh.hobby.name,
            })),
            progress: s.userHobbies.length > 0 ? 'Intermediate' : 'Beginner', // Placeholder logic matching UI expectation
        }));
        res.json(formattedStudents);
    }
    catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};
// Students applying to jobs
export const getAvailableJobs = async (req, res) => {
    try {
        // Find jobs that are approved and deadline has not passed
        const jobs = await prisma.job.findMany({
            where: {
                status: 'approved',
            },
            include: {
                giver: {
                    include: { profile: true },
                },
                applications: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        // Format for student view
        const formattedJobs = jobs.map((job) => {
            const hasApplied = req.user
                ? job.applications.some((app) => app.studentId === req.user?.userId)
                : false;
            return {
                id: job.id,
                title: job.title,
                description: job.description,
                hobbyCategory: job.hobbyCategory,
                jobType: job.jobType,
                location: job.location,
                payment: job.payment,
                paymentType: job.paymentType,
                requirements: job.requirements,
                experienceLevel: job.experienceLevel,
                positionsAvailable: job.positionsAvailable,
                applicationDeadline: job.applicationDeadline,
                organizationName: job.giver.profile?.firstName
                    ? `${job.giver.profile.firstName} ${job.giver.profile.lastName || ''}`.trim()
                    : null,
                hasApplied,
            };
        });
        res.json(formattedJobs);
    }
    catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ error: 'Failed to fetch available jobs' });
    }
};
// Apply to a job
export const applyToJob = async (req, res) => {
    try {
        const studentId = req.user?.userId;
        if (!studentId)
            return res.status(401).json({ error: 'Unauthorized' });
        const jobId = parseInt(req.params.jobId);
        const { fullName, email, phone, description } = req.body;
        const cvFile = req.file;
        if (!fullName || !email || !phone) {
            return res.status(400).json({ error: 'Full name, email, and phone are required.' });
        }
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (job.status !== 'approved') {
            return res.status(400).json({ error: 'Job is not open for applications' });
        }
        const existingApp = await prisma.jobApplication.findUnique({
            where: {
                jobId_studentId: { jobId, studentId },
            },
        });
        if (existingApp) {
            return res.status(400).json({ error: 'You have already applied for this job' });
        }
        const application = await prisma.jobApplication.create({
            data: {
                jobId,
                studentId,
                fullName,
                email,
                phone,
                description: description || null,
                cvUrl: cvFile ? `/uploads/cvs/${cvFile.filename}` : null,
                cvName: cvFile ? cvFile.originalname : null,
                status: 'pending',
            },
        });
        res.status(201).json(application);
    }
    catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ error: 'Failed to apply for job' });
    }
};
// Update job post
export const updateJob = async (req, res) => {
    try {
        const giverId = req.user?.userId;
        if (!giverId)
            return res.status(401).json({ error: 'Unauthorized' });
        const jobId = parseInt(req.params.id);
        const { title, description, hobbyCategory, jobType, location, payment, paymentType, requirements, experienceLevel, positionsAvailable, applicationDeadline, } = req.body;
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        if (job.giverId !== giverId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden. Not your job post.' });
        }
        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                title,
                description,
                hobbyCategory,
                jobType,
                location,
                payment: payment ? parseFloat(payment) : undefined,
                paymentType,
                requirements,
                experienceLevel,
                positionsAvailable: positionsAvailable ? parseInt(positionsAvailable) : undefined,
                applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
                status: 'pending', // Revert to pending for admin re-approval upon edit
            },
        });
        res.json(updatedJob);
    }
    catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ error: 'Failed to update job' });
    }
};
