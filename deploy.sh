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

# 检查根目录是否有 wrangler.toml
if [ -f "wrangler.toml" ]; then
    echo "📥 使用根目录配置部署..."
    # 安装根目录依赖
    if [ ! -d "node_modules" ]; then
        echo "📥 安装根目录依赖..."
        npm install
    fi
    
    # 安装 worker 依赖
    if [ ! -d "worker/node_modules" ]; then
        echo "📥 安装 Worker 依赖..."
        cd worker && npm install && cd ..
    fi
    
    # 检查配置
    if grep -q "^[[:space:]]*database_id[[:space:]]*=" wrangler.toml && ! grep -q "^[[:space:]]*#.*database_id" wrangler.toml; then
        echo "✅ Worker 配置已就绪"
    else
        echo "⚠️  请先配置 wrangler.toml 中的数据库 ID"
        echo "   运行以下命令配置资源:"
        echo "   ./setup-resources.sh"
        echo ""
        echo "   或手动创建资源:"
        echo "   npx wrangler d1 create med-sales-db"
        echo "   npx wrangler r2 bucket create med-sales-images"
        echo "   然后更新 wrangler.toml 中的 database_id"
        exit 1
    fi
    
    # 部署 Worker
    echo "🌍 部署 Worker 到 Cloudflare..."
    npx wrangler publish
else
    echo "📥 使用 worker 目录配置部署..."
    cd worker

    # 安装依赖
    if [ ! -d "node_modules" ]; then
        echo "📥 安装后端依赖..."
        npm install
    fi

    # 检查配置
    if grep -q "^[[:space:]]*database_id[[:space:]]*=" wrangler.toml && ! grep -q "^[[:space:]]*#.*database_id" wrangler.toml; then
        echo "✅ Worker 配置已就绪"
    else
        echo "⚠️  请先配置 wrangler.toml 中的数据库 ID"
        echo "   运行以下命令配置资源:"
        echo "   ./setup-resources.sh"
        echo ""
        echo "   或手动创建资源:"
        echo "   wrangler d1 create med-sales-db"
        echo "   wrangler r2 bucket create med-sales-images"
        echo "   然后更新 wrangler.toml 中的 database_id"
        exit 1
    fi

    # 部署 Worker
    echo "🌍 部署 Worker 到 Cloudflare..."
    wrangler publish
    
    cd ..
fi

# 获取 Worker URL
if [ -f "wrangler.toml" ]; then
    WORKER_URL=$(npx wrangler whoami 2>/dev/null | grep -o 'https://[^[:space:]]*\.workers\.dev' | head -1)
else
    WORKER_URL=$(cd worker && wrangler whoami 2>/dev/null | grep -o 'https://[^[:space:]]*\.workers\.dev' | head -1)
fi

if [ -z "$WORKER_URL" ]; then
    WORKER_URL="https://medical-sales-worker.your-subdomain.workers.dev"
fi
echo "✅ Worker 部署成功: $WORKER_URL"

# 部署前端
echo "🎨 部署前端..."
cd frontend

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
if command -v wrangler >/dev/null 2>&1; then
    wrangler pages deploy dist --project-name=medical-sales-frontend
else
    npx wrangler pages deploy dist --project-name=medical-sales-frontend
fi

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