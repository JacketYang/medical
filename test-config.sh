#!/bin/bash

# 测试 wrangler 配置文件
echo "🧪 测试 Cloudflare Workers 部署配置..."

# 测试根目录配置
echo "📋 测试根目录 wrangler.toml..."
if [ -f "wrangler.toml" ]; then
    echo "✅ 找到根目录 wrangler.toml"
    
    # 测试 dry-run
    echo "🔍 测试配置文件语法..."
    if npx wrangler deploy --dry-run > /dev/null 2>&1; then
        echo "✅ 根目录配置文件语法正确"
    else
        echo "❌ 根目录配置文件有错误"
        npx wrangler deploy --dry-run
        exit 1
    fi
else
    echo "❌ 未找到根目录 wrangler.toml"
fi

# 测试 worker 目录配置
echo ""
echo "📋 测试 worker 目录 wrangler.toml..."
cd worker
if [ -f "wrangler.toml" ]; then
    echo "✅ 找到 worker 目录 wrangler.toml"
    
    # 测试 dry-run
    echo "🔍 测试配置文件语法..."
    if npx wrangler deploy --dry-run > /dev/null 2>&1; then
        echo "✅ Worker 目录配置文件语法正确"
    else
        echo "❌ Worker 目录配置文件有错误"
        npx wrangler deploy --dry-run
        exit 1
    fi
else
    echo "❌ 未找到 worker 目录 wrangler.toml"
fi

cd ..

echo ""
echo "🎉 所有配置测试通过！"
echo ""
echo "📋 部署选项："
echo "1. 使用一键部署按钮 (deploy.html)"
echo "2. 使用 GitHub Actions"
echo "3. 使用本地部署脚本: ./deploy.sh"
echo "4. 手动部署: npx wrangler deploy"