import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  getSponsorships,
  sponsorEvent,
  getMyJobs,
  createJob,
  deleteJob,
  getJobApplications,
  updateJobApplication,
  getStudents,
  getAvailableJobs,
  applyToJob,
  updateJob,
} from '../controllers/scholarshipGiverController.js';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/cvs';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const cvUpload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

// Student-accessible job endpoints (still under scholarship-giver group)
router.get('/jobs/available', authenticateToken, getAvailableJobs);
router.post('/jobs/:jobId/apply', authenticateToken, requireRole(['student']), cvUpload.single('cv'), applyToJob);

// Scholar Giver endpoints
router.get('/sponsorships', authenticateToken, requireRole(['scholarship_giver', 'admin']), getSponsorships);
router.post('/sponsor/:eventId', authenticateToken, requireRole(['scholarship_giver', 'admin']), sponsorEvent);

router.get('/jobs', authenticateToken, requireRole(['scholarship_giver', 'admin']), getMyJobs);
router.post('/jobs', authenticateToken, requireRole(['scholarship_giver', 'admin']), createJob);
router.put('/jobs/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), updateJob);
router.delete('/jobs/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), deleteJob);

router.get('/job-applications', authenticateToken, requireRole(['scholarship_giver', 'admin']), getJobApplications);
router.put('/job-applications/:id', authenticateToken, requireRole(['scholarship_giver', 'admin']), updateJobApplication);

router.get('/students', authenticateToken, requireRole(['scholarship_giver', 'admin']), getStudents);

export default router;
