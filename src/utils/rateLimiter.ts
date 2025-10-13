import rateLimit from 'express-rate-limit';
import { config } from '@/config';

/**
 * 创建速率限制中间件
 * 使用 express-rate-limit 库实现标准的速率限制功能
 */
export const createRateLimit = (options?: {
  maxRequests?: number;
  windowMs?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const {
    maxRequests = config.rateLimit.maxRequests,
    windowMs = config.rateLimit.windowMs,
    message = '请求过于频繁，请稍后再试',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options || {};

  return rateLimit({
    windowMs, // 时间窗口
    max: maxRequests, // 最大请求数
    message: {
      success: false,
      message,
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString()
    },
    standardHeaders: true, // 返回标准的 `RateLimit-*` 头
    legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
    skipSuccessfulRequests, // 是否跳过成功的请求计数
    skipFailedRequests, // 是否跳过失败的请求计数
    // 自定义键生成器，基于IP地址
    keyGenerator: (req) => {
      return req.ip || 'unknown';
    },
    // 自定义跳过逻辑
    skip: (req) => {
      // 可以在这里添加跳过某些请求的逻辑
      // 例如：跳过健康检查请求
      return req.path === '/health';
    },
    // 自定义处理器
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message,
        error: 'Too Many Requests',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

/**
 * 认证相关的速率限制
 * 用于登录、注册等敏感操作
 */
export const authRateLimit = createRateLimit({
  maxRequests: config.rateLimit.maxRequests,
  windowMs: config.rateLimit.windowMs,
  message: '认证请求过于频繁，请稍后再试',
  skipSuccessfulRequests: false, // 成功的请求也计数
  skipFailedRequests: false // 失败的请求也计数
});

/**
 * 文件上传的速率限制
 * 相对宽松一些，但仍需要限制
 */
export const uploadRateLimit = createRateLimit({
  maxRequests: config.rateLimit.maxRequests,
  windowMs: config.rateLimit.windowMs,
  message: '文件上传过于频繁，请稍后再试',
  skipSuccessfulRequests: false,
  skipFailedRequests: true // 上传失败不计数
});

/**
 * 通用API速率限制
 * 用于一般的API请求
 */
export const apiRateLimit = createRateLimit({
  maxRequests: config.rateLimit.maxRequests * 2, // 相对宽松
  windowMs: config.rateLimit.windowMs,
  message: 'API请求过于频繁，请稍后再试',
  skipSuccessfulRequests: false,
  skipFailedRequests: true
});

/**
 * 严格的速率限制
 * 用于特别敏感的操作
 */
export const strictRateLimit = createRateLimit({
  maxRequests: Math.max(1, Math.floor(config.rateLimit.maxRequests / 2)), // 更严格
  windowMs: config.rateLimit.windowMs,
  message: '操作过于频繁，请稍后再试',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});
