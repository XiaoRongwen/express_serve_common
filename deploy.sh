#!/bin/bash

# 部署脚本 - 适用于宝塔面板环境
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Rong Backend API..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="rong-backend-api"
NODE_VERSION="18" # 建议使用的Node.js版本

# 检查Node.js版本
check_node_version() {
    echo -e "${BLUE}📋 检查Node.js版本...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js未安装，请先安装Node.js ${NODE_VERSION}+${NC}"
        exit 1
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        echo -e "${YELLOW}⚠️  当前Node.js版本: v$(node -v), 建议使用v${NODE_VERSION}+${NC}"
    else
        echo -e "${GREEN}✅ Node.js版本检查通过: $(node -v)${NC}"
    fi
}

# 检查PM2
check_pm2() {
    echo -e "${BLUE}📋 检查PM2...${NC}"
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}⚠️  PM2未安装，正在安装...${NC}"
        npm install -g pm2
        echo -e "${GREEN}✅ PM2安装完成${NC}"
    else
        echo -e "${GREEN}✅ PM2已安装: $(pm2 -v)${NC}"
    fi
}

# 安装依赖
install_dependencies() {
    echo -e "${BLUE}📦 安装项目依赖...${NC}"
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install
    fi
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
}

# 构建项目
build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    npm run build
    echo -e "${GREEN}✅ 项目构建完成${NC}"
}

# 数据库操作
setup_database() {
    echo -e "${BLUE}🗄️  设置数据库...${NC}"
    
    # 检查.env文件
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env文件不存在，请先配置环境变量${NC}"
        echo -e "${YELLOW}   可以参考.env.example文件${NC}"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 生成Prisma客户端
    echo -e "${BLUE}   生成Prisma客户端...${NC}"
    npm run db:generate
    
    # 推送数据库架构（谨慎使用）
    echo -e "${YELLOW}⚠️  是否要推送数据库架构？这会修改数据库结构${NC}"
    read -p "推送数据库架构？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:push
        echo -e "${GREEN}✅ 数据库架构已推送${NC}"
    fi
}

# 创建必要目录
create_directories() {
    echo -e "${BLUE}📁 创建必要目录...${NC}"
    mkdir -p logs
    mkdir -p uploads
    echo -e "${GREEN}✅ 目录创建完成${NC}"
}

# 设置文件权限
set_permissions() {
    echo -e "${BLUE}🔐 设置文件权限...${NC}"
    chmod -R 755 uploads/
    chmod -R 755 logs/
    echo -e "${GREEN}✅ 文件权限设置完成${NC}"
}

# 停止现有进程
stop_existing() {
    echo -e "${BLUE}🛑 停止现有进程...${NC}"
    if pm2 list | grep -q "$PROJECT_NAME"; then
        pm2 stop "$PROJECT_NAME"
        pm2 delete "$PROJECT_NAME"
        echo -e "${GREEN}✅ 现有进程已停止${NC}"
    else
        echo -e "${YELLOW}⚠️  没有找到运行中的进程${NC}"
    fi
}

# 启动应用
start_application() {
    echo -e "${BLUE}🚀 启动应用...${NC}"
    pm2 start ecosystem.config.js --env production
    pm2 save
    echo -e "${GREEN}✅ 应用启动完成${NC}"
}

# 显示状态
show_status() {
    echo -e "${BLUE}📊 应用状态:${NC}"
    pm2 status
    pm2 logs "$PROJECT_NAME" --lines 10
}

# 主部署流程
main() {
    echo -e "${GREEN}🎯 开始部署 $PROJECT_NAME${NC}"
    echo "=================================="
    
    check_node_version
    check_pm2
    install_dependencies
    build_project
    setup_database
    create_directories
    set_permissions
    stop_existing
    start_application
    
    echo "=================================="
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${BLUE}📝 查看日志: pm2 logs $PROJECT_NAME${NC}"
    echo -e "${BLUE}📊 查看状态: pm2 status${NC}"
    echo -e "${BLUE}🔄 重启应用: pm2 restart $PROJECT_NAME${NC}"
    echo -e "${BLUE}🛑 停止应用: pm2 stop $PROJECT_NAME${NC}"
    
    show_status
}

# 执行主流程
main "$@"
