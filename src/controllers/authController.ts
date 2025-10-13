import { Request, Response, NextFunction } from 'express';
import { success, badRequest, unauthorized, forbidden, notFound } from '../utils/response';
import { 
  generateToken, 
  generateRefreshToken, 
  validateEmail, 
  validatePasswordStrength, 
  hashPassword, 
  comparePassword,
  verifyRefreshToken,
  JWTPayload,
  RefreshTokenPayload
} from '../utils/auth';
import { prisma } from '../utils/database';
import { config } from '../config';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * 用户注册
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, email, password, avatar } = req.body;

    // 验证必填字段
    if (!name || !email || !password) {
      return badRequest(res, '姓名、邮箱和密码为必填项');
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return badRequest(res, '邮箱格式不正确');
    }

    // 验证密码强度
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return badRequest(res, passwordValidation.errors.join('; '));
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return badRequest(res, '该邮箱已被注册');
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: avatar || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        createdAt: true
      }
    });

    // 生成JWT令牌
    const tokenPayload: JWTPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(newUser.id);

    // 返回用户信息和令牌
    return success(res, {
      user: newUser,
      token,
      refreshToken,
      expiresIn: config.jwt.expiresIn
    }, '注册成功', 201);

  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // 验证必填字段
    if (!email || !password) {
      return badRequest(res, '邮箱和密码为必填项');
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return badRequest(res, '邮箱格式不正确');
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return unauthorized(res, '邮箱或密码错误');
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return forbidden(res, '账户已被禁用，请联系管理员');
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return unauthorized(res, '邮箱或密码错误');
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // 生成JWT令牌
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(user.id);

    // 返回用户信息和令牌（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return success(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
      expiresIn: config.jwt.expiresIn
    }, '登录成功');

  } catch (error) {
    next(error);
  }
};

/**
 * 刷新令牌
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return badRequest(res, '刷新令牌不能为空');
    }

    // 验证并解析刷新令牌
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (!refreshPayload) {
      return unauthorized(res, '无效的刷新令牌');
    }

    // 从刷新令牌中获取用户ID，重新从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: refreshPayload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true
      }
    });

    if (!user) {
      return unauthorized(res, '用户不存在');
    }

    if (!user.isActive) {
      return forbidden(res, '账户已被禁用');
    }

    // 生成新的令牌
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name
    };

    const newToken = generateToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(user.id);

    return success(res, {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: config.jwt.expiresIn
    }, '令牌刷新成功');

  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // 从数据库获取最新的用户信息 (req.user 由 authenticateToken 中间件保证存在)
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return notFound(res, '用户不存在');
    }

    if (!user.isActive) {
      return forbidden(res, '账户已被禁用');
    }

    return success(res, user, '获取用户信息成功');

  } catch (error) {
    next(error);
  }
};

/**
 * 修改密码
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 验证必填字段
    if (!currentPassword || !newPassword) {
      return badRequest(res, '当前密码和新密码为必填项');
    }

    // 验证新密码强度
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return badRequest(res, passwordValidation.errors.join('; '));
    }

    // 获取用户信息 (req.user 由 authenticateToken 中间件保证存在)
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user) {
      return notFound(res, '用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return badRequest(res, '当前密码错误');
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return badRequest(res, '新密码不能与当前密码相同');
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    return success(res, null, '密码修改成功');

  } catch (error) {
    next(error);
  }
};

/**
 * 用户登出（可选实现，主要是客户端删除token）
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // 在实际项目中，可以将token加入黑名单
    // 这里只是返回成功消息，实际的登出逻辑由客户端处理（删除本地存储的token）
    
    return success(res, null, '登出成功');

  } catch (error) {
    next(error);
  }
};

/**
 * 验证邮箱是否可用（注册前检查）
 */
export const checkEmailAvailability = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return badRequest(res, '邮箱参数不能为空');
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return badRequest(res, '邮箱格式不正确');
    }

    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    return success(res, {
      email,
      available: !existingUser
    }, existingUser ? '邮箱已被注册' : '邮箱可用');

  } catch (error) {
    next(error);
  }
};