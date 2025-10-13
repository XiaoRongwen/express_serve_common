import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 应用配置
 */
export const config = {
  // 服务器配置
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
    // 连接池配置（多实例部署必需）
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10),
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '10000', 10),
    poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '10000', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '600000', 10),
    maxLifetime: parseInt(process.env.DB_MAX_LIFETIME || '1800000', 10),
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'auth-backend',
    audience: process.env.JWT_AUDIENCE || 'auth-frontend'
  },
  
  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  // 密码配置
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '6', 10),
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128', 10)
  },
  
  // 速率限制配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分钟
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10)
  },
  
  // bcrypt配置
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  // 文件上传配置
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']
  }
};

/**
 * 验证必需的环境变量
 */
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
  }
  
  if (!config.jwt.secret) {
    throw new Error('JWT_SECRET 环境变量是必需的');
  }
  
  if (config.jwt.secret.length < 32) {
    console.warn('⚠️  为了更好的安全性，JWT_SECRET 应该至少32个字符长');
  }

  // 验证数据库配置
  if (!config.database.url) {
    throw new Error('DATABASE_URL 环境变量是必需的');
  }

  // 验证连接池配置
  if (config.database.connectionLimit < 1 || config.database.connectionLimit > 100) {
    console.warn('⚠️  DB_CONNECTION_LIMIT 应该在 1 到 100 之间');
  }

  if (config.database.connectTimeout < 1000) {
    console.warn('⚠️  DB_CONNECT_TIMEOUT 应该至少为 1000 毫秒');
  }
};
