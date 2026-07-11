import prisma from '../lib/prisma.js';
import { generateCertificate, getCredentialById } from '../services/certifierService.js';
export const debugStudentCertificates = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const studentEmail = req.user.email;
        console.log('🔍 ===== DEBUG: Student Certificate Check =====');
        console.log('🔍 Student ID:', studentId);
        console.log('🔍 Student Email:', studentEmail);
        const allAICerts = await prisma.certifierCertificate.findMany();
        const allManualCerts = await prisma.certificate.findMany();
        console.log('🔍 Total AI certs in system:', allAICerts.length);
        console.log('🔍 Total Manual certs in system:', allManualCerts.length);
        const [manualCerts, aiCerts] = await Promise.all([
            prisma.certificate.findMany({
                where: { studentId: Number(studentId) },
                orderBy: { issuedAt: 'desc' },
                include: {
                    teacher: { include: { profile: true } },
                    template: true
                }
            }),
            prisma.certifierCertificate.findMany({
                where: { studentId: Number(studentId) },
                orderBy: { issuedAt: 'desc' },
                include: {
                    issuer: { include: { profile: true } }
                }
            })
        ]);
        const aiCertsByEmail = await prisma.certifierCertificate.findMany({
            where: { studentEmail: studentEmail }
        });
        res.json({
            debug: {
                studentId,
                studentEmail,
                allAICertsCount: allAICerts.length,
                allManualCertsCount: allManualCerts.length,
                studentAICertsCount: aiCerts.length,
                studentManualCertsCount: manualCerts.length,
                aiCertsByEmailCount: aiCertsByEmail.length,
                allAICerts: allAICerts.map((c) => ({
                    id: c.id,
                    studentId: c.studentId,
                    studentEmail: c.studentEmail,
                    studentName: c.studentName,
                    hobbyName: c.hobbyName
                })),
                aiCertsByEmail: aiCertsByEmail.map((c) => ({
                    id: c.id,
                    studentId: c.studentId,
                    studentEmail: c.studentEmail,
                    studentName: c.studentName,
                    hobbyName: c.hobbyName
                })),
                studentAICerts: aiCerts.map((c) => ({
                    id: c.id,
                    studentId: c.studentId,
                    studentEmail: c.studentEmail,
                    hobbyName: c.hobbyName
                }))
            }
        });
    }
    catch (error) {
        console.error('❌ Debug error:', error);
        res.status(500).json({ error: error.message });
    }
};
export const getAdminStudents = async (req, res) => {
    try {
        console.log('📊 Fetching all students for admin...');
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
                profile: true
            },
            orderBy: {
                profile: {
                    firstName: 'asc'
                }
            }
        });
        console.log('📊 Found students:', students.length);
        const formattedStudents = students.map((student) => ({
            id: student.id,
            name: student.profile?.firstName
                ? `${student.profile.firstName} ${student.profile.lastName || ''}`.trim()
                : student.email,
            email: student.email
        }));
        res.json({
            success: true,
            data: formattedStudents
        });
    }
    catch (error) {
        console.error('❌ Fetch students error:', error);
        res.status(500).json({
            error: 'Failed to fetch students',
            details: error.message
        });
    }
};
export const issueCertificate = async (req, res) => {
    try {
        const { studentName, studentEmail, hobbyName, teacherName, studentId: providedStudentId } = req.body;
        console.log('📝 ===== ISSUE CERTIFICATE =====');
        console.log('📝 Student Name:', studentName);
        console.log('📝 Student Email:', studentEmail);
        console.log('📝 Student ID (provided):', providedStudentId);
        console.log('📝 Hobby Name:', hobbyName);
        console.log('📝 Teacher Name:', teacherName);
        if (!studentName || !studentEmail || !hobbyName) {
            return res.status(400).json({
                error: 'Missing required fields: studentName, studentEmail, hobbyName'
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }
        const credentialGroupId = process.env.CERTIFIER_CREDENTIAL_GROUP_ID;
        if (!credentialGroupId) {
            return res.status(500).json({
                error: 'Certifier Credential Group ID not configured'
            });
        }
        // Find student - first by providedStudentId, then by email
        let student = null;
        if (providedStudentId) {
            student = await prisma.user.findUnique({
                where: { id: Number(providedStudentId) }
            });
            console.log('📝 Found student by ID:', student ? `Yes (ID: ${student.id})` : 'No');
        }
        if (!student) {
            student = await prisma.user.findUnique({
                where: { email: studentEmail }
            });
            console.log('📝 Found student by email:', student ? `Yes (ID: ${student.id})` : 'No');
        }
        if (!student) {
            const bcrypt = await import('bcrypt');
            const placeholderPassword = await bcrypt.hash(`placeholder_${Date.now()}`, 10);
            student = await prisma.user.create({
                data: {
                    email: studentEmail,
                    password: placeholderPassword,
                    isVerified: true,
                    isActive: true,
                    profile: {
                        create: {
                            firstName: studentName.split(' ')[0] || studentName,
                            lastName: studentName.split(' ').slice(1).join(' ') || ''
                        }
                    },
                    roles: {
                        create: {
                            role: {
                                connect: { name: 'student' }
                            }
                        }
                    }
                }
            });
            console.log('✅ Created new student user with ID:', student.id);
        }
        const resolvedTeacherName = teacherName || 'HobbyHub Instructor';
        // Try Certifier API but don't block on failure
        let credentialId = null;
        let certifierSuccess = false;
        try {
            const result = await generateCertificate({
                studentName,
                studentEmail,
                hobbyName,
                teacherName: resolvedTeacherName,
                credentialGroupId
            });
            credentialId = result.credentialId;
            certifierSuccess = true;
            console.log('✅ Certifier API success, credentialId:', credentialId);
        }
        catch (certifierError) {
            credentialId = `local-${Date.now()}-${student.id}`;
            console.warn('⚠️ Certifier API failed (using local ID):', certifierError.message);
        }
        // Always store in database regardless of Certifier API result
        let savedCert = null;
        try {
            const certData = {
                credentialId: credentialId,
                studentId: student.id,
                studentName: studentName,
                studentEmail: studentEmail,
                hobbyName: hobbyName,
                teacherName: resolvedTeacherName,
                issuedBy: req.user?.userId || null,
                issuedAt: new Date(),
                status: 'issued'
            };
            console.log('📝 Storing certificate data:', certData);
            savedCert = await prisma.certifierCertificate.create({ data: certData });
            console.log('✅ Certificate stored in DB — ID:', savedCert.id, 'studentId:', savedCert.studentId);
        }
        catch (dbError) {
            console.error('❌ Failed to store certificate in database:', dbError.message);
            return res.status(500).json({
                error: 'Certificate issued by Certifier but failed to save to database',
                details: dbError.message
            });
        }
        res.json({
            success: true,
            message: certifierSuccess
                ? 'AI Certificate issued and sent to student dashboard!'
                : 'Certificate created and saved to student dashboard (AI service unavailable)',
            credentialId: credentialId,
            studentEmail: studentEmail,
            studentId: student.id,
            certId: savedCert?.id
        });
    }
    catch (error) {
        console.error('❌ Certificate issuance error:', error);
        res.status(500).json({
            error: 'Failed to issue certificate',
            details: error.message
        });
    }
};
export const getAllCertificates = async (req, res) => {
    try {
        const [manualCertificates, aiCertificates] = await Promise.all([
            prisma.certificate.findMany({
                orderBy: { issuedAt: 'desc' },
                include: {
                    student: { include: { profile: true } },
                    teacher: { include: { profile: true } },
                    template: true
                }
            }),
            prisma.certifierCertificate.findMany({
                orderBy: { issuedAt: 'desc' },
                include: {
                    student: { include: { profile: true } },
                    issuer: { include: { profile: true } }
                }
            })
        ]);
        console.log('📊 Admin: Found certificates:', {
            manual: manualCertificates.length,
            ai: aiCertificates.length
        });
        const formattedManual = manualCertificates.map((cert) => ({
            id: `manual-${cert.id}`,
            credentialId: null,
            recipient: {
                name: cert.student?.profile?.firstName
                    ? `${cert.student.profile.firstName} ${cert.student.profile.lastName || ''}`.trim()
                    : 'Unknown',
                email: cert.student?.email || 'Unknown'
            },
            hobbyName: cert.template?.title || 'Manual Certificate',
            teacherName: cert.teacher?.profile?.firstName
                ? `${cert.teacher.profile.firstName} ${cert.teacher.profile.lastName || ''}`.trim()
                : 'Unknown',
            issuedOn: cert.issuedAt ? new Date(cert.issuedAt).toISOString().split('T')[0] : 'N/A',
            status: 'issued',
            type: 'manual'
        }));
        const formattedAI = aiCertificates.map((cert) => ({
            id: `ai-${cert.id}`,
            credentialId: cert.credentialId,
            recipient: {
                name: cert.studentName || 'Unknown',
                email: cert.studentEmail || 'Unknown'
            },
            hobbyName: cert.hobbyName || 'N/A',
            teacherName: cert.teacherName || 'Unknown',
            issuedOn: cert.issuedAt ? new Date(cert.issuedAt).toISOString().split('T')[0] : 'N/A',
            status: cert.status || 'issued',
            type: 'ai'
        }));
        const allCertificates = [...formattedManual, ...formattedAI]
            .sort((a, b) => {
            const dateA = a.issuedOn ? new Date(a.issuedOn).getTime() : 0;
            const dateB = b.issuedOn ? new Date(b.issuedOn).getTime() : 0;
            return dateB - dateA;
        });
        res.json({
            success: true,
            data: allCertificates
        });
    }
    catch (error) {
        console.error('❌ Fetch certificates error:', error);
        res.status(500).json({
            error: 'Failed to fetch certificates',
            details: error.message
        });
    }
};
export const getStudentCertificates = async (req, res) => {
    try {
        const studentId = Number(req.user.userId);
        const studentEmail = req.user.email;
        console.log('📊 ===== STUDENT CERTIFICATE DEBUG =====');
        console.log('📊 Student ID:', studentId);
        console.log('📊 Student Email:', studentEmail);
        // AUTO-FIX: Update ALL certificates with matching email to this studentId
        try {
            const updated = await prisma.$executeRaw `
                UPDATE "CertifierCertificate" 
                SET "studentId" = ${studentId}
                WHERE "studentEmail" = ${studentEmail}
                  AND "studentId" != ${studentId}
            `;
            if (updated > 0) {
                console.log(`✅ Auto-fixed ${updated} certificates with studentId ${studentId}`);
            }
        }
        catch (fixError) {
            console.log('⚠️ Auto-fix failed (continuing anyway):', fixError);
        }
        // Get BOTH manual AND AI certificates
        const [manualCerts, aiCerts] = await Promise.all([
            prisma.certificate.findMany({
                where: { studentId: studentId },
                orderBy: { issuedAt: 'desc' },
                include: {
                    teacher: {
                        include: {
                            profile: true
                        }
                    },
                    template: true
                }
            }),
            prisma.certifierCertificate.findMany({
                where: {
                    OR: [
                        { studentId: studentId },
                        { studentEmail: studentEmail }
                    ]
                },
                orderBy: { issuedAt: 'desc' },
                include: {
                    issuer: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        ]);
        console.log('📊 Found certificates:', {
            manual: manualCerts.length,
            ai: aiCerts.length
        });
        // Format manual certificates
        const formattedManual = manualCerts.map((cert) => ({
            id: cert.id,
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
        const formattedAI = aiCerts.map((cert) => ({
            id: cert.id,
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
        // Combine BOTH types and sort by date (newest first)
        const allCertificates = [...formattedManual, ...formattedAI]
            .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
        console.log('📊 Total certificates returned:', allCertificates.length);
        console.log('📊 Manual count:', formattedManual.length);
        console.log('📊 AI count:', formattedAI.length);
        res.json(allCertificates);
    }
    catch (error) {
        console.error('❌ Fetch student certificates error:', error);
        res.status(500).json([]);
    }
};
export const getMyCertificates = async (req, res) => {
    try {
        const studentId = Number(req.user.userId);
        const [manualCerts, aiCerts] = await Promise.all([
            prisma.certificate.findMany({
                where: { studentId: studentId },
                orderBy: { issuedAt: 'desc' },
                include: {
                    teacher: {
                        include: {
                            profile: true
                        }
                    },
                    template: true
                }
            }),
            prisma.certifierCertificate.findMany({
                where: { studentId: studentId },
                orderBy: { issuedAt: 'desc' },
                include: {
                    issuer: {
                        include: {
                            profile: true
                        }
                    }
                }
            })
        ]);
        const formattedManual = manualCerts.map((cert) => ({
            id: `manual-${cert.id}`,
            title: cert.template?.title || 'Certificate',
            hobbyName: cert.template?.title || 'Manual Certificate',
            teacherName: cert.teacher?.profile?.firstName
                ? `${cert.teacher.profile.firstName} ${cert.teacher.profile.lastName || ''}`.trim()
                : 'Unknown',
            issuedOn: cert.issuedAt ? new Date(cert.issuedAt).toISOString().split('T')[0] : 'N/A',
            type: 'manual'
        }));
        const formattedAI = aiCerts.map((cert) => ({
            id: `ai-${cert.id}`,
            title: `${cert.hobbyName || 'N/A'} Certificate`,
            hobbyName: cert.hobbyName || 'N/A',
            teacherName: cert.teacherName || 'Unknown',
            issuedOn: cert.issuedAt ? new Date(cert.issuedAt).toISOString().split('T')[0] : 'N/A',
            type: 'ai',
            credentialId: cert.credentialId
        }));
        const allCertificates = [...formattedManual, ...formattedAI]
            .sort((a, b) => {
            const dateA = a.issuedOn ? new Date(a.issuedOn).getTime() : 0;
            const dateB = b.issuedOn ? new Date(b.issuedOn).getTime() : 0;
            return dateB - dateA;
        });
        res.json({
            success: true,
            data: allCertificates
        });
    }
    catch (error) {
        console.error('❌ Fetch student certificates error:', error);
        res.status(500).json({
            error: 'Failed to fetch certificates',
            details: error.message
        });
    }
};
export const getCertificateById = async (req, res) => {
    try {
        const { id } = req.params;
        const isAI = id.startsWith('ai-');
        const isManual = id.startsWith('manual-');
        const isCertifier = id.startsWith('certifier-');
        const actualId = parseInt(id.replace(/^(ai-|manual-|certifier-)/, ''));
        let certificate = null;
        if (isManual || !isAI) {
            certificate = await prisma.certificate.findUnique({
                where: { id: actualId },
                include: {
                    student: { include: { profile: true } },
                    teacher: { include: { profile: true } },
                    template: true
                }
            });
            if (certificate) {
                return res.json({
                    success: true,
                    data: { ...certificate, type: 'manual' }
                });
            }
        }
        if (isAI || isCertifier) {
            const aiCert = await prisma.certifierCertificate.findUnique({
                where: { id: actualId },
                include: {
                    student: { include: { profile: true } },
                    issuer: { include: { profile: true } }
                }
            });
            if (aiCert) {
                return res.json({
                    success: true,
                    data: { ...aiCert, type: 'ai' }
                });
            }
            try {
                const certifierData = await getCredentialById(id);
                if (certifierData) {
                    return res.json({
                        success: true,
                        data: {
                            id: `certifier-${certifierData.id}`,
                            credentialId: certifierData.id,
                            studentName: certifierData.recipient?.name || 'Unknown',
                            studentEmail: certifierData.recipient?.email || 'Unknown',
                            hobbyName: certifierData.metadata?.hobby || certifierData.customAttributes?.hobby || 'N/A',
                            teacherName: certifierData.metadata?.teacher || certifierData.customAttributes?.teacher || 'N/A',
                            issuedAt: certifierData.issuedOn || certifierData.createdAt,
                            status: certifierData.status || 'issued',
                            type: 'certifier-api'
                        }
                    });
                }
            }
            catch (certifierError) {
                console.log('⚠️ Could not fetch from Certifier API:', certifierError);
            }
        }
        return res.status(404).json({
            error: 'Certificate not found'
        });
    }
    catch (error) {
        console.error('❌ Fetch certificate error:', error);
        res.status(500).json({
            error: 'Failed to fetch certificate',
            details: error.message
        });
    }
};
export const downloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = Number(req.user.userId);
        const isAI = id.startsWith('ai-');
        const isManual = id.startsWith('manual-');
        const actualId = parseInt(id.replace(/^(ai-|manual-|certifier-)/, ''));
        if (isNaN(actualId)) {
            return res.status(400).json({ error: 'Invalid certificate ID format' });
        }
        if (isAI) {
            const aiCert = await prisma.certifierCertificate.findUnique({
                where: { id: actualId }
            });
            if (aiCert) {
                if (aiCert.studentId !== studentId && !req.user.roles?.includes('admin')) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .certificate { border: 5px solid #FF7A45; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 10px; }
                        h1 { color: #FF7A45; font-size: 2.5em; }
                        .name { font-size: 2em; margin: 20px 0; font-weight: bold; }
                        .details { font-size: 1.2em; color: #666; }
                        .sparkle { color: #FF7A45; }
                    </style>
                </head>
                <body>
                    <div class="certificate">
                        <h1>🎓 Certificate of Completion</h1>
                        <p>This certifies that</p>
                        <div class="name">${aiCert.studentName}</div>
                        <p>has successfully completed</p>
                        <div class="details">${aiCert.hobbyName}</div>
                        <p>under the instruction of</p>
                        <div class="details">${aiCert.teacherName || 'HobbyHub Instructor'}</div>
                        <p>Issued on: ${new Date(aiCert.issuedAt).toLocaleDateString()}</p>
                        <p style="margin-top: 30px; font-size: 0.8em; color: #999;">
                            ✨ AI-Generated Certificate ✨
                        </p>
                        <p style="font-size: 0.7em; color: #ccc;">
                            Credential ID: ${aiCert.credentialId}
                        </p>
                    </div>
                </body>
                </html>
            `;
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `attachment; filename=certificate-${aiCert.id}.html`);
                return res.send(html);
            }
        }
        if (isManual || !isAI) {
            const manualCert = await prisma.certificate.findUnique({
                where: { id: actualId },
                include: {
                    student: true,
                    teacher: { include: { profile: true } },
                    template: true
                }
            });
            if (manualCert) {
                if (manualCert.studentId !== studentId && !req.user.roles?.includes('admin')) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
                const html = manualCert.certificateHtml || `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            .certificate { border: 5px solid #FF7A45; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 10px; }
                            h1 { color: #FF7A45; font-size: 2.5em; }
                            .name { font-size: 2em; margin: 20px 0; font-weight: bold; }
                            .details { font-size: 1.2em; color: #666; }
                        </style>
                    </head>
                    <body>
                        <div class="certificate">
                            <h1>🎓 Certificate</h1>
                            <p>This certifies that</p>
                            <div class="name">${manualCert.student?.profile?.firstName || 'Student'}</div>
                            <p>has successfully completed</p>
                            <div class="details">${manualCert.template?.title || 'Course'}</div>
                            ${manualCert.customMessage ? `<p style="font-style: italic;">${manualCert.customMessage}</p>` : ''}
                            <p>Issued on: ${new Date(manualCert.issuedAt).toLocaleDateString()}</p>
                        </div>
                    </body>
                    </html>
                `;
                res.setHeader('Content-Type', 'text/html');
                res.setHeader('Content-Disposition', `attachment; filename=certificate-${manualCert.id}.html`);
                return res.send(html);
            }
        }
        return res.status(404).json({ error: 'Certificate not found' });
    }
    catch (error) {
        console.error('❌ Download certificate error:', error);
        res.status(500).json({
            error: 'Failed to download certificate',
            details: error.message
        });
    }
};
