#!/bin/bash

# 医疗器械销售官网 - 部署脚本
# 自动化部署前后端到 Cloudflare

set -e

echo "🚀 开始部署医疗器械销售官网..."

# 检查必要的工具
command -v wrangler >/dev/null 2>&1 || { echo "❌ 请先安装 Wrangler CLI: npm install -g wrangler"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ 请先安装 Node.js"; exit 1; }

# 部署后端
echo "📦 部署后端 Worker..."
cd worker

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📥 安装后端依赖..."
    npm install
fi

# 检查配置
if ! grep -q "your-d1-database-id" wrangler.toml; then
    echo "✅ Worker 配置已就绪"
else
    echo "⚠️  请先配置 wrangler.toml 中的数据库 ID 和存储桶名称"
    echo "   运行以下命令获取资源 ID:"
    echo "   wrangler d1 create med-sales-db"
    echo "   wrangler r2 bucket create med-sales-images"
    exit 1
fi

# 部署 Worker
echo "🌍 部署 Worker 到 Cloudflare..."
wrangler publish

# 获取 Worker URL
WORKER_URL=$(wrangler whoami | grep -o 'https://[^[:space:]]*\.workers\.dev' | head -1)
if [ -z "$WORKER_URL" ]; then
    WORKER_URL="https://medical-sales-worker.your-subdomain.workers.dev"
fi
echo "✅ Worker 部署成功: $WORKER_URL"

# 部署前端
echo "🎨 部署前端..."
cd ../frontend

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi

# 设置环境变量
echo "VITE_API_URL=$WORKER_URL/api" > .env.production

# 构建前端
echo "🔨 构建前端应用..."
npm run build

# 部署到 Pages
echo "📄 部署到 Cloudflare Pages..."
wrangler pages deploy dist --project-name=medical-sales-frontend

# 获取 Pages URL
PAGES_URL="https://medical-sales-frontend.pages.dev"
echo "✅ 前端部署成功: $PAGES_URL"

# 完成提示
echo ""
echo "🎉 部署完成！"
echo ""
echo "📊 部署信息:"
echo "   • 后端 API: $WORKER_URL"
echo "   • 前端网站: $PAGES_URL"
echo ""
echo "🔧 后续步骤:"
echo "   1. 配置自定义域名（可选）"
echo "   2. 设置环境变量和密钥"
echo "   3. 验证网站功能"
echo "   4. 配置监控和备份"
echo ""
echo "📚 详细文档请参考 DEPLOYMENT.md"