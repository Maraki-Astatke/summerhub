import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import * as certificateController from '../controllers/certificateController.js';

const router = Router();
router.get(
    '/debug/student-certificates',
    authenticateToken,
    certificateController.debugStudentCertificates
);


router.get(
    '/admin/students',
    authenticateToken,
    requireRole(['admin']),
    certificateController.getAdminStudents
);


router.post(
    '/certificates/issue',
    authenticateToken,
    requireRole(['teacher', 'admin']),
    certificateController.issueCertificate
);

router.get(
    '/certificates/all',
    authenticateToken,
    requireRole(['admin', 'teacher']),
    certificateController.getAllCertificates
);


router.get(
    '/dashboard/certificates',
    authenticateToken,
    requireRole(['student']),
    certificateController.getStudentCertificates
);


router.get(
    '/certificates/my-certificates',
    authenticateToken,
    requireRole(['student']),
    certificateController.getMyCertificates
);

router.get(
    '/certificates/:id',
    authenticateToken,
    certificateController.getCertificateById
);


router.get(
    '/certificates/:id/download',
    authenticateToken,
    certificateController.downloadCertificate
);

export default router;