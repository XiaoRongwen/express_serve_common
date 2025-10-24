# 🚀 Rong Backend API 部署指南

本文档详细介绍如何在宝塔面板环境下使用PM2部署Rong Backend API服务。

## 📋 目录

- [系统要求](#系统要求)
- [准备工作](#准备工作)
- [快速部署](#快速部署)
- [手动部署](#手动部署)
- [配置说明](#配置说明)
- [常用命令](#常用命令)
- [监控和维护](#监控和维护)
- [故障排除](#故障排除)

## 🔧 系统要求

- **操作系统**: Linux (推荐 Ubuntu 18.04+, CentOS 7+)
- **Node.js**: v18.0.0 或更高版本
- **数据库**: MySQL 5.7+ 或 8.0+
- **内存**: 至少 1GB RAM
- **存储**: 至少 2GB 可用空间
- **宝塔面板**: 7.0+ 版本

## 📦 准备工作

### 1. 安装Node.js

在宝塔面板中安装Node.js：

1. 进入宝塔面板 → 软件商店
2. 搜索并安装 "Node.js版本管理器"
3. 安装Node.js 18.x版本

或者通过命令行安装：

```bash
# 使用NodeSource仓库安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### 2. 安装PM2

```bash
# 全局安装PM2
npm install -g pm2

# 验证安装
pm2 -v
```

### 3. 准备数据库

在宝塔面板中创建MySQL数据库：

1. 进入宝塔面板 → 数据库
2. 创建新数据库
3. 记录数据库名、用户名、密码

## ⚡ 快速部署

### 使用自动部署脚本

1. **上传项目文件**到服务器（建议路径：`/var/www/rong-backend`）

2. **配置环境变量**：
   ```bash
   # 复制环境配置模板
   cp env.production .env
   
   # 编辑环境配置
   nano .env
   ```

3. **运行部署脚本**：
   ```bash
   # 给脚本执行权限
   chmod +x deploy.sh
   
   # 执行部署
   ./deploy.sh
   ```

部署脚本会自动完成以下操作：
- ✅ 检查Node.js和PM2环境
- ✅ 安装项目依赖
- ✅ 构建TypeScript项目
- ✅ 设置数据库
- ✅ 创建必要目录
- ✅ 启动PM2服务

## 🔨 手动部署

如果需要手动控制部署过程：

### 1. 项目准备

```bash
# 进入项目目录
cd /var/www/rong-backend

# 安装依赖
npm install

# 构建项目
npm run build

# 生成Prisma客户端
npm run db:generate
```

### 2. 环境配置

```bash
# 复制并编辑环境配置
cp env.production .env
nano .env

# 主要配置项：
# - DATABASE_URL: 数据库连接字符串
# - JWT_SECRET: JWT密钥
# - CORS_ORIGIN: 前端域名
# - PORT: 服务端口
```

### 3. 数据库设置

```bash
# 推送数据库架构（首次部署）
npm run db:push

# 或者使用迁移（推荐生产环境）
npx prisma migrate deploy
```

### 4. 创建目录

```bash
# 创建日志和上传目录
mkdir -p logs uploads

# 设置权限
chmod -R 755 uploads/ logs/
```

### 5. 启动服务

```bash
# 使用PM2启动
npm run pm2:start:prod

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup
```

## ⚙️ 配置说明

### PM2配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'rong-backend-api',
    script: 'dist/index.js',
    instances: 'max',        // 使用所有CPU核心
    exec_mode: 'cluster',    // 集群模式
    max_memory_restart: '1G', // 内存限制
    autorestart: true,       // 自动重启
    watch: false,           // 生产环境关闭文件监听
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

### 环境变量配置

关键配置项说明：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | JWT密钥（64字符以上） | `your-super-secret-key...` |
| `CORS_ORIGIN` | 允许的前端域名 | `https://your-domain.com` |
| `PORT` | 服务端口 | `4000` |
| `REDIS_URL` | Redis连接（可选） | `redis://localhost:6379` |

## 📝 常用命令

### PM2管理命令

```bash
# 查看服务状态
npm run pm2:status

# 查看日志
npm run pm2:logs

# 重启服务
npm run pm2:restart

# 停止服务
npm run pm2:stop

# 删除服务
npm run pm2:delete

# 监控面板
npm run pm2:monit
```

### 应用管理命令

```bash
# 构建项目
npm run build

# 数据库操作
npm run db:generate  # 生成Prisma客户端
npm run db:push      # 推送数据库架构
npm run db:studio    # 打开数据库管理界面

# 部署相关
npm run deploy       # 完整部署流程
npm run deploy:prod  # 快速生产部署
```

## 📊 监控和维护

### 1. 日志管理

日志文件位置：
- 综合日志: `logs/combined.log`
- 输出日志: `logs/out.log`
- 错误日志: `logs/error.log`

```bash
# 实时查看日志
tail -f logs/combined.log

# 查看错误日志
tail -f logs/error.log

# PM2日志
pm2 logs rong-backend-api --lines 100
```

### 2. 性能监控

```bash
# PM2监控面板
pm2 monit

# 查看进程详情
pm2 show rong-backend-api

# 系统资源使用
htop
```

### 3. 健康检查

应用提供健康检查端点：

```bash
# 检查服务是否正常
curl http://localhost:4000/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

## 🔧 宝塔面板配置

### 1. 反向代理设置

在宝塔面板中配置Nginx反向代理：

1. 进入网站管理 → 选择域名 → 反向代理
2. 添加反向代理：
   - 代理名称: `rong-backend-api`
   - 目标URL: `http://127.0.0.1:4000`
   - 发送域名: `$host`

### 2. SSL证书配置

1. 进入网站管理 → SSL
2. 申请Let's Encrypt免费证书
3. 强制HTTPS访问

### 3. 防火墙设置

确保开放必要端口：
- HTTP: 80
- HTTPS: 443
- 应用端口: 4000（内部访问）

## 🚨 故障排除

### 常见问题

#### 1. 服务启动失败

```bash
# 检查日志
pm2 logs rong-backend-api

# 常见原因：
# - 端口被占用
# - 数据库连接失败
# - 环境变量配置错误
```

#### 2. 数据库连接问题

```bash
# 测试数据库连接
npm run db:studio

# 检查配置
echo $DATABASE_URL
```

#### 3. 内存不足

```bash
# 检查内存使用
free -h

# 调整PM2配置
# 在ecosystem.config.js中设置：
# max_memory_restart: '512M'
```

#### 4. 文件权限问题

```bash
# 设置正确权限
sudo chown -R www-data:www-data /var/www/rong-backend
chmod -R 755 uploads/ logs/
```

### 日志分析

#### 查看错误日志
```bash
# PM2错误日志
pm2 logs rong-backend-api --err

# 应用错误日志
tail -f logs/error.log | grep ERROR
```

#### 性能问题排查
```bash
# 查看进程状态
pm2 show rong-backend-api

# 内存使用情况
ps aux | grep node

# 网络连接
netstat -tulpn | grep :4000
```

## 🔄 更新部署

### 代码更新流程

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖
npm install

# 3. 构建项目
npm run build

# 4. 更新数据库（如有变更）
npm run db:push

# 5. 重启服务
npm run pm2:reload
```

### 零停机更新

```bash
# 使用PM2 reload实现零停机更新
pm2 reload rong-backend-api

# 或使用脚本
./deploy.sh
```

## 📞 技术支持

如果遇到部署问题，请检查：

1. **系统要求**是否满足
2. **环境变量**是否正确配置
3. **数据库连接**是否正常
4. **端口**是否被占用
5. **权限**是否正确设置

更多问题请查看项目文档或提交Issue。

---

**部署完成后，记得：**
- ✅ 测试所有API端点
- ✅ 验证文件上传功能
- ✅ 检查日志输出
- ✅ 设置监控告警
- ✅ 备份数据库

祝您部署顺利！🎉
