import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { storage, upload, postUploadProductimage } from "../controllers/uploadController.js";

const router = Router();
router.post('/upload/product-image', authenticateToken, upload.single('image'), postUploadProductimage);

export default router;
