# Backend API Service

一个基于 Node.js + Express + TypeScript 的后台服务，提供用户认证、文件上传等基础功能。

## 🚀 主要功能

- ✅ 用户注册和登录
- ✅ JWT 身份验证
- ✅ 文件上传和访问
- ✅ 密码强度验证
- ✅ 速率限制防护
- ✅ 统一错误处理
- ✅ TypeScript 支持
- ✅ 环境配置管理

## 📋 API 接口

### 用户认证 (v1)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 | ❌ |
| POST | `/api/v1/auth/login` | 用户登录 | ❌ |
| POST | `/api/v1/auth/refresh` | 刷新令牌 | ✅ |
| GET | `/api/v1/auth/me` | 获取当前用户信息 | ✅ |
| PUT | `/api/v1/auth/password` | 修改密码 | ✅ |
| POST | `/api/v1/auth/logout` | 用户登出 | ✅ |
| GET | `/api/v1/auth/check-email` | 检查邮箱可用性 | ❌ |

### 文件管理 (v1)

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/api/v1/upload` | 上传文件 | ✅ |
| GET | `/api/v1/files/:filename` | 访问文件 | ❌ |
| DELETE | `/api/v1/files/:id` | 删除文件 | ✅ |
| GET | `/api/v1/files` | 获取文件列表 | ✅ |

### 系统接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/health` | 健康检查（包含数据库连接状态） |
| GET | `/api` | API版本信息 |
| GET | `/api/v1` | API v1 信息 |

## 🛠️ 快速开始

### 1. 环境要求

- Node.js >= 16
- MySQL >= 8.0
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp env.example .env
```

编辑 `.env` 文件，配置必需的环境变量：

```env
# 数据库连接 (必需)
DATABASE_URL="mysql://username:password@localhost:3306/db_name"

# JWT密钥 (必需，至少32个字符)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters"

# 文件上传配置
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,pdf,doc,docx"
```

### 4. 数据库设置

```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# (可选) 查看数据库
npx prisma studio
```

### 5. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

服务将在 `http://localhost:4000` 启动。

## ⚙️ 配置选项

### 服务器配置

```env
PORT=4000                          # 服务端口
NODE_ENV=development               # 运行环境
CORS_ORIGIN=http://localhost:3000  # 跨域配置
```

### 数据库连接池配置

```env
DB_CONNECTION_LIMIT=10             # 连接池最大连接数
DB_CONNECT_TIMEOUT=60000           # 连接超时时间(毫秒)
DB_QUERY_TIMEOUT=10000             # 查询超时时间(毫秒)
DB_POOL_TIMEOUT=10000              # 连接池获取连接超时(毫秒)
DB_IDLE_TIMEOUT=600000             # 空闲连接超时(毫秒)
DB_MAX_LIFETIME=1800000            # 连接最大生命周期(毫秒)
```

### 文件上传配置

```env
UPLOAD_DIR=uploads                 # 上传目录
MAX_FILE_SIZE=10485760            # 最大文件大小(10MB)
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx  # 允许的文件类型
```

### 密码策略

```env
PASSWORD_MIN_LENGTH=6              # 最小长度
PASSWORD_MAX_LENGTH=128            # 最大长度
PASSWORD_REQUIRE_UPPERCASE=true    # 需要大写字母
PASSWORD_REQUIRE_LOWERCASE=true    # 需要小写字母
PASSWORD_REQUIRE_NUMBERS=true      # 需要数字
PASSWORD_REQUIRE_SPECIAL_CHARS=false # 需要特殊字符
```

### 速率限制

```env
RATE_LIMIT_WINDOW_MS=900000        # 时间窗口(15分钟)
RATE_LIMIT_MAX_REQUESTS=5          # 普通限制次数
RATE_LIMIT_STRICT_MAX_REQUESTS=3   # 严格限制次数(登录等)
```

### JWT配置

```env
JWT_EXPIRES_IN=24h                 # 访问令牌过期时间
JWT_REFRESH_EXPIRES_IN=7d          # 刷新令牌过期时间
JWT_ISSUER=backend-api             # 令牌发行者
JWT_AUDIENCE=frontend-app          # 令牌受众
```

## 📁 项目结构

```
src/
├── config/           # 配置管理
├── controllers/      # 控制器
│   ├── authController.ts
│   └── fileController.ts
├── middleware/       # 中间件
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   └── uploadMiddleware.ts
├── routes/          # 路由定义
│   ├── auth.ts
│   ├── file.ts
│   └── api.ts
├── utils/           # 工具函数
└── index.ts         # 应用入口

prisma/
├── schema.prisma    # 数据库模型
└── migrations/      # 数据库迁移

uploads/             # 文件上传目录
```

## 🔒 安全特性

- **身份验证**: JWT 令牌验证
- **密码加密**: bcrypt 哈希加密
- **文件安全**: 文件类型和大小限制
- **速率限制**: 防止暴力破解攻击
- **输入验证**: 严格的数据验证
- **错误处理**: 统一的错误响应格式
- **CORS 配置**: 跨域请求控制

## 🚀 部署

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### 环境变量检查

启动前确保设置了所有必需的环境变量：

- `DATABASE_URL`
- `JWT_SECRET`

## 📝 开发说明

### 添加新的 API 接口

1. 在 `src/controllers/` 中创建控制器
2. 在 `src/routes/` 中定义路由
3. 在 `src/routes/api.ts` 中注册路由
4. 更新数据库模型（如需要）

### 数据库操作

```bash
# 查看数据库
npx prisma studio

# 重置数据库
npx prisma db push --force-reset

# 生成客户端
npx prisma generate
```