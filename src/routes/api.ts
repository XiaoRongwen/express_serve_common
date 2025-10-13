import { Router } from 'express';
import { healthCheck } from '@/utils/database';
import v1Routes from './v1';

const router = Router();

// 健康检查路由
router.get('/health', async (req, res) => {
  const dbHealthy = await healthCheck();
  
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API根信息路由
router.get('/api', (req, res) => {
  res.json({
    message: 'Backend API Service',
    version: '1.0.0',
    description: 'A backend service with authentication and file upload',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      upload: '/api/v1/upload',
      static: '/static'
    }
  });
});

// v1 路由（简化版本控制）
router.use('/api/v1', v1Routes);

export default router;
