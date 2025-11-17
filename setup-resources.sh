#!/bin/bash

# 医疗器械销售官网 - 资源配置脚本
# 自动创建 Cloudflare D1 数据库和 R2 存储桶，并更新配置文件

set -e

echo "🔧 开始配置 Cloudflare 资源..."
echo ""

# 检查必要的工具
command -v wrangler >/dev/null 2>&1 || { 
    echo "❌ 请先安装 Wrangler CLI: npm install -g wrangler"; 
    exit 1; 
}

# 检查登录状态
echo "📋 检查 Cloudflare 登录状态..."
if ! wrangler whoami >/dev/null 2>&1; then
    echo "❌ 未登录 Cloudflare，请先运行: wrangler login"
    exit 1
fi
echo "✅ 已登录 Cloudflare"
echo ""

# 创建 D1 数据库
echo "📊 创建 D1 数据库..."
DB_OUTPUT=$(wrangler d1 create med-sales-db 2>&1 || true)

if echo "$DB_OUTPUT" | grep -q "database_id"; then
    # 提取数据库 ID
    DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)
    echo "✅ D1 数据库创建成功！"
    echo "   Database ID: $DB_ID"
    echo ""
    
    # 更新 worker/wrangler.toml
    echo "📝 更新 worker/wrangler.toml 配置..."
    sed -i "s|# database_id = \"\" # 取消注释并填写实际的D1数据库ID|database_id = \"$DB_ID\"|g" worker/wrangler.toml
    
    # 更新根目录 wrangler.toml（如果存在）
    if [ -f "wrangler.toml" ]; then
        echo "📝 更新 wrangler.toml 配置..."
        sed -i "s|# database_id = \"\" # 取消注释并填写实际的D1数据库ID|database_id = \"$DB_ID\"|g" wrangler.toml
    fi
    
    echo "✅ 配置文件已更新"
    echo ""
elif echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo "⚠️  数据库 med-sales-db 已存在"
    echo "   请手动获取 database_id 并更新配置文件"
    echo "   运行命令: wrangler d1 list"
    echo ""
else
    echo "⚠️  创建数据库时出现问题："
    echo "$DB_OUTPUT"
    echo ""
fi

# 创建 R2 存储桶
echo "📦 创建 R2 存储桶..."
R2_OUTPUT=$(wrangler r2 bucket create med-sales-images 2>&1 || true)

if echo "$R2_OUTPUT" | grep -q "Created bucket"; then
    echo "✅ R2 存储桶创建成功！"
    echo "   Bucket Name: med-sales-images"
    echo ""
elif echo "$R2_OUTPUT" | grep -q "already exists"; then
    echo "⚠️  存储桶 med-sales-images 已存在"
    echo ""
else
    echo "⚠️  创建存储桶时出现问题："
    echo "$R2_OUTPUT"
    echo ""
fi

# 初始化数据库结构
if [ -f "worker/schema.sql" ]; then
    echo "🗄️  初始化数据库结构..."
    if wrangler d1 execute med-sales-db --file=./worker/schema.sql 2>&1; then
        echo "✅ 数据库结构创建成功"
        echo ""
    else
        echo "⚠️  数据库结构可能已存在"
        echo ""
    fi
fi

# 导入种子数据（可选）
if [ -f "worker/seed.sql" ]; then
    echo "🌱 导入种子数据..."
    read -p "是否导入示例数据？(y/n) [y]: " -n 1 -r
    echo ""
    REPLY=${REPLY:-y}
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if wrangler d1 execute med-sales-db --file=./worker/seed.sql 2>&1; then
            echo "✅ 种子数据导入成功"
            echo ""
        else
            echo "⚠️  种子数据可能已存在"
            echo ""
        fi
    else
        echo "⏭️  跳过种子数据导入"
        echo ""
    fi
fi

# 配置环境变量（Secrets）
echo "🔐 配置环境变量..."
echo "   接下来需要设置以下 Secrets："
echo "   1. JWT_SECRET - JWT 密钥"
echo "   2. ADMIN_USERNAME - 管理员用户名"
echo "   3. ADMIN_PASSWORD - 管理员密码"
echo ""

read -p "是否现在配置 Secrets？(y/n) [n]: " -n 1 -r
echo ""
REPLY=${REPLY:-n}
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "设置 JWT_SECRET:"
    wrangler secret put JWT_SECRET
    
    echo "设置 ADMIN_USERNAME:"
    wrangler secret put ADMIN_USERNAME
    
    echo "设置 ADMIN_PASSWORD:"
    wrangler secret put ADMIN_PASSWORD
    
    echo "✅ Secrets 配置完成"
    echo ""
else
    echo "⏭️  跳过 Secrets 配置"
    echo "   稍后可运行以下命令配置："
    echo "   wrangler secret put JWT_SECRET"
    echo "   wrangler secret put ADMIN_USERNAME"
    echo "   wrangler secret put ADMIN_PASSWORD"
    echo ""
fi

# 显示摘要
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 资源配置完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 配置摘要:"
if [ -n "$DB_ID" ]; then
    echo "   • D1 数据库: med-sales-db (ID: $DB_ID)"
else
    echo "   • D1 数据库: 请检查配置"
fi
echo "   • R2 存储桶: med-sales-images"
echo ""
echo "🚀 下一步:"
echo "   1. 运行 ./deploy.sh 或 npm run deploy 部署应用"
echo "   2. 或参考 DEPLOYMENT.md 进行手动部署"
echo ""
echo "📚 更多帮助:"
echo "   • 部署指南: DEPLOYMENT.md"
echo "   • 一键部署: ONE_CLICK_DEPLOY.md"
echo "   • API 测试: API_TESTING.md"
echo ""
