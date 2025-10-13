import { Request, Response, NextFunction } from 'express';
import { unauthorized, forbidden, badRequest, error } from '../utils/response';
import { extractTokenFromHeader, verifyToken } from '../utils/auth';
import { prisma } from '../utils/database';
import { config } from '@/config';

/**
 * JWT认证中间件
 * 验证请求头中的JWT令牌，并将用户信息添加到req.user中
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 从请求头中提取token
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      unauthorized(res, '访问令牌不能为空');
      return;
    }

    // 验证token
    const decoded = verifyToken(token);

    // 验证用户是否仍然存在且处于活跃状态
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    });

    if (!user) {
      unauthorized(res, '用户不存在');
      return;
    }

    if (!user.isActive) {
      forbidden(res, '账户已被禁用');
      return;
    }

    // 将用户信息添加到请求对象中
    req.user = decoded;
    next();

  } catch (error: any) {
    if (error.message.includes('Token已过期')) {
      unauthorized(res, 'Token已过期，请重新登录');
    } else if (error.message.includes('无效的Token')) {
      unauthorized(res, '无效的访问令牌');
    } else {
      unauthorized(res, 'Token验证失败');
    }
  }
};


