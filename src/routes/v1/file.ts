import { Router } from 'express';
import { uploadFile, deleteFile } from '@/controllers/fileController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { uploadRateLimit } from '@/utils/rateLimiter';
import { uploadSingle, handleUploadError } from '@/middleware/uploadMiddleware';
import { config } from '@/config';

const router = Router();

// 文件上传速率限制 - 使用新的 express-rate-limit 实现

/**
 * 上传文件
 * POST /api/v1/upload
 */
router.post('/upload', 
  uploadRateLimit,
  authenticateToken, 
  uploadSingle('file'), 
  handleUploadError,
  uploadFile
);

/**
 * 删除文件
 * DELETE /api/v1/files/:id
 */
router.delete('/files/:id', authenticateToken, deleteFile);

export default router;
