import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { upload, postUploadProductimage } from "../controllers/uploadController.js";
const router = Router();
router.post('/upload/product-image', authenticateToken, upload.single('image'), postUploadProductimage);
export default router;
