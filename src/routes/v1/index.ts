import { Router } from 'express';
import authRoutes from './auth';
import fileRoutes from './file';

const router = Router();

// API v1 信息路由
router.get('/', (req, res) => {
  res.json({
    message: 'API v1 is working!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      upload: '/api/v1/upload',
      static: '/static'
    }
  });
});

// 认证相关路由
router.use('/auth', authRoutes);
// 文件相关路由
router.use('/', fileRoutes);

export default router;
