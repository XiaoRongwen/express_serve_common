# 🚀 快速开始

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

```bash
cp env.example .env
```

编辑 `.env` 文件，设置必需的配置：

```env
DATABASE_URL="mysql://root:password@localhost:3306/db_name"
JWT_SECRET="your-32-character-secret-key-here"
```

## 3. 设置数据库

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库表
npx prisma db push
```

## 4. 启动服务

```bash
npm run dev
```

## 5. 测试 API

访问 http://localhost:4000/health 检查服务状态。

### 检查API状态

```bash
# 检查API版本信息
curl http://localhost:4000/api

# 检查健康状态（包含数据库连接）
curl http://localhost:4000/health
```

### 注册用户

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 登录获取令牌

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### 上传文件

```bash
curl -X POST http://localhost:4000/api/v1/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

### 获取文件列表

```bash
curl -X GET http://localhost:4000/api/v1/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

就这么简单！🎉