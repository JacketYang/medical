#!/bin/bash

# 测试 wrangler 配置文件和 D1 数据库绑定设置
echo "🧪 测试 Cloudflare Workers 部署配置..."
echo ""

# 步骤 1: 测试预处理脚本
echo "📋 Step 1: 测试 Wrangler 配置预处理脚本..."
if [ -f "scripts/prepare-wrangler-config.js" ]; then
    echo "✅ 找到预处理脚本"
    
    # 测试使用模拟的 database_id
    echo "🔍 测试脚本功能..."
    if D1_DATABASE_ID="d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b" node scripts/prepare-wrangler-config.js; then
        echo "✅ 预处理脚本运行成功"
        
        # 验证 wrangler.toml 是否被更新
        if grep -q "database_id = \"d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b\"" wrangler.toml; then
            echo "✅ wrangler.toml 已正确更新"
        else
            echo "⚠️  wrangler.toml 未正确更新"
        fi
    else
        echo "⚠️  预处理脚本运行出错"
    fi
    
    # 恢复配置文件
    echo "🔄 恢复配置文件..."
    git checkout wrangler.toml worker/wrangler.toml 2>/dev/null || true
else
    echo "❌ 未找到预处理脚本"
fi

echo ""

# 测试根目录配置
echo "📋 Step 2: 测试根目录 wrangler.toml..."
if [ -f "wrangler.toml" ]; then
    echo "✅ 找到根目录 wrangler.toml"
    
    # 检查 database_id 是否被注释
    if grep -q "# database_id" wrangler.toml; then
        echo "✅ database_id 正确注释（等待填写）"
    else
        echo "⚠️  database_id 行不是注释状态"
    fi
else
    echo "❌ 未找到根目录 wrangler.toml"
fi

echo ""

# 测试 worker 目录配置
echo "📋 Step 3: 测试 worker 目录 wrangler.toml..."
cd worker
if [ -f "wrangler.toml" ]; then
    echo "✅ 找到 worker 目录 wrangler.toml"
    
    # 检查 database_id 是否被注释
    if grep -q "# database_id" wrangler.toml; then
        echo "✅ database_id 正确注释（等待填写）"
    else
        echo "⚠️  database_id 行不是注释状态"
    fi
    
    # 测试 package.json 中的 deploy 脚本
    echo "🔍 测试 package.json 脚本配置..."
    if grep -q "prebuild" package.json && grep -q "npm run prebuild" package.json; then
        echo "✅ Deploy 脚本正确配置了 prebuild"
    else
        echo "⚠️  Deploy 脚本未正确配置 prebuild"
    fi
else
    echo "❌ 未找到 worker 目录 wrangler.toml"
fi

cd ..

echo ""

# 测试 database_id 是否可以正确读取
echo "📋 Step 4: 测试数据库 ID 读取..."
if [ -n "$D1_DATABASE_ID" ]; then
    echo "✅ 检测到 D1_DATABASE_ID 环境变量: $D1_DATABASE_ID"
else
    echo "ℹ️  D1_DATABASE_ID 环境变量未设置"
    echo "   可以通过以下方式设置："
    echo "   export D1_DATABASE_ID=<your-actual-database-id>"
fi

echo ""
echo "🎉 配置测试完成！"
echo ""
echo "📋 下一步："
echo "1. 创建 D1 数据库（如果还未创建）:"
echo "   wrangler d1 create med-sales-db"
echo "2. 设置环境变量或使用预处理脚本："
echo "   export D1_DATABASE_ID=<your-database-id>"
echo "   或"
echo "   node scripts/prepare-wrangler-config.js"
echo "3. 部署应用："
echo "   npm run deploy  (或 cd worker && npm run deploy)"
echo ""
echo "📚 详细文档："
echo "   - CLOUDFLARE_PAGES_SETUP.md"
echo "   - FIX_D1_BINDING_ID.md"
echo "   - DEPLOYMENT.md"