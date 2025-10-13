import { Router } from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  getCurrentUser, 
  changePassword, 
  logout, 
  checkEmailAvailability 
} from '@/controllers/authController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { authRateLimit } from '@/utils/rateLimiter';
import { config } from '@/config';

const router = Router();

// 敏感操作限流 - 使用新的 express-rate-limit 实现

// 用户注册
router.post('/register', authRateLimit, register);

// 用户登录
router.post('/login', authRateLimit, login);

// 刷新访问令牌
router.post('/refresh', authenticateToken, refreshToken);

// 获取当前用户信息
router.get('/me', authenticateToken, getCurrentUser);

// 修改密码
router.put('/password', authenticateToken, authRateLimit, changePassword);

// 用户登出
router.post('/logout', authenticateToken, logout);

// 检查邮箱可用性
router.get('/check-email', checkEmailAvailability);

export default router;
