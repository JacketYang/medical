#!/bin/bash

# Cloudflare Pages 构建脚本
# 在部署前自动配置 Wrangler D1 数据库

set -e

echo "🔧 Cloudflare Pages Build Script"
echo "=================================="
echo ""

# 检查是否在 Cloudflare Pages 环境中
if [ -n "$CF_PAGES_COMMIT_SHA" ]; then
    echo "✅ Detected Cloudflare Pages environment"
    echo "   Commit: $CF_PAGES_COMMIT_SHA"
else
    echo "ℹ️  Running in local or non-Cloudflare environment"
fi

# 步骤 1: 预处理 Wrangler 配置
echo ""
echo "📋 Step 1: Preparing Wrangler configuration..."

# 使用 Node.js 脚本来处理配置（更可靠）
if [ -f "scripts/prepare-wrangler-config.js" ]; then
    if node scripts/prepare-wrangler-config.js; then
        echo "✅ Configuration preparation successful"
    else
        echo "⚠️  Configuration preparation encountered an issue"
        echo "   Deployment will attempt to continue..."
    fi
else
    echo "⚠️  prepare-wrangler-config.js not found"
    
    # 备选方案：直接使用 sed 更新
    if [ -n "$D1_DATABASE_ID" ]; then
        echo "📝 Updating wrangler.toml with D1_DATABASE_ID..."
        
        # 更新 worker/wrangler.toml
        if [ -f "worker/wrangler.toml" ]; then
            sed -i.bak "s|# database_id = \"\" # 取消注释并填写实际的D1数据库ID|database_id = \"$D1_DATABASE_ID\"|g" worker/wrangler.toml
        fi
        
        # 更新根目录 wrangler.toml（如果存在）
        if [ -f "wrangler.toml" ]; then
            sed -i.bak "s|# database_id = \"\" # 取消注释并填写实际的D1数据库ID|database_id = \"$D1_DATABASE_ID\"|g" wrangler.toml
        fi
        
        echo "✅ Configuration updated"
    else
        echo "⚠️  D1_DATABASE_ID environment variable not set"
        echo "   To fix this, set the environment variable in Cloudflare Pages:"
        echo "   Settings > Build & deployments > Build configuration > Environment variables"
        echo "   Add: D1_DATABASE_ID = <your-database-id>"
    fi
fi

# 步骤 2: 安装依赖
echo ""
echo "📋 Step 2: Installing dependencies..."
npm ci

# 步骤 3: 安装 Worker 依赖
echo "📋 Step 3: Installing Worker dependencies..."
cd worker
npm ci
cd ..

# 步骤 4: 构建 Worker
echo "📋 Step 4: Building and deploying Worker..."
if npm run deploy; then
    echo "✅ Worker deployed successfully"
else
    echo "❌ Worker deployment failed"
    echo "   This might be due to missing or invalid D1_DATABASE_ID"
    echo "   Please check the configuration and try again"
    exit 1
fi

# 步骤 5: 构建前端
echo ""
echo "📋 Step 5: Building frontend..."
cd frontend
npm ci
npm run build
echo "✅ Frontend built successfully"

cd ..

echo ""
echo "🎉 Build completed!"
echo ""
echo "📌 For more information:"
echo "   See CLOUDFLARE_PAGES_SETUP.md for detailed setup instructions"
