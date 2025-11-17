# API 测试示例

本文档提供了医疗器械销售官网 API 的测试示例，使用 curl 命令进行测试。

## 基础配置

```bash
# 设置 API 基础 URL
API_BASE="https://your-worker-domain.workers.dev/api"

# 设置认证 Token（登录后获取）
TOKEN=""
```

## 1. 用户认证

### 登录获取 Token

```bash
curl -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  }
}
```

### 验证 Token

```bash
curl -X POST "$API_BASE/auth/verify" \
  -H "Authorization: Bearer $TOKEN"
```

### 刷新 Token

```bash
curl -X POST "$API_BASE/auth/refresh" \
  -H "Authorization: Bearer $TOKEN"
```

## 2. 产品管理

### 获取产品列表

```bash
# 基础查询
curl "$API_BASE/products"

# 带分页的查询
curl "$API_BASE/products?page=1&pageSize=10"

# 搜索产品
curl "$API_BASE/products?q=超声"

# 按分类筛选
curl "$API_BASE/products?category=医疗设备"
```

### 获取单个产品

```bash
# 通过 ID 获取
curl "$API_BASE/products/1"

# 通过 slug 获取
curl "$API_BASE/products/portable-ultrasound-scanner"
```

### 创建产品（需要认证）

```bash
curl -X POST "$API_BASE/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "智能血压监测仪",
    "summary": "高精度血压监测设备",
    "description": "<p>这是一款先进的血压监测设备...</p>",
    "price": 2500.00,
    "category": "医疗设备",
    "images": ["https://example.com/product1.jpg"],
    "specs": {
      "brand": "MedTech",
      "model": "BP-2000",
      "accuracy": "±3mmHg"
    },
    "featured": true
  }'
```

### 更新产品（需要认证）

```bash
curl -X PUT "$API_BASE/products/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "更新的产品名称",
    "price": 2600.00
  }'
```

### 删除产品（需要认证）

```bash
curl -X DELETE "$API_BASE/products/1" \
  -H "Authorization: Bearer $TOKEN"
```

## 3. 文章管理

### 获取文章列表

```bash
# 获取已发布的文章
curl "$API_BASE/posts"

# 包含草稿的文章（需要认证）
curl "$API_BASE/posts?status=all"
```

### 获取单篇文章

```bash
curl "$API_BASE/posts/1"
curl "$API_BASE/posts/latest-medical-technology-trends"
```

### 创建文章（需要认证）

```bash
curl -X POST "$API_BASE/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "2024年医疗技术新趋势",
    "summary": "探讨最新的医疗技术发展方向",
    "content": "<p>2024年医疗技术领域正在经历前所未有的变革...</p>",
    "author": "医学编辑部",
    "featured": true
  }'
```

### 更新文章（需要认证）

```bash
curl -X PUT "$API_BASE/posts/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "更新的文章标题"
  }'
```

### 删除文章（需要认证）

```bash
curl -X DELETE "$API_BASE/posts/1" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. 站点设置

### 获取所有设置

```bash
curl "$API_BASE/settings"
```

### 获取特定设置

```bash
curl "$API_BASE/settings/site_title"
```

### 更新设置（需要认证）

```bash
curl -X PUT "$API_BASE/settings/site_title" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "value": "医疗器械销售官网",
    "description": "网站标题"
  }'
```

### 批量更新设置（需要认证）

```bash
curl -X PUT "$API_BASE/settings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "settings": {
      "site_title": "新的网站标题",
      "contact_email": "new@example.com"
    }
  }'
```

## 5. 文件上传

### 获取预签名上传 URL（需要认证）

```bash
curl -X POST "$API_BASE/upload/url" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "filename": "product-image.jpg",
    "contentType": "image/jpeg",
    "size": 1024000
  }'
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://your-bucket.r2.cloudflarestorage.com/uploads/file.jpg?X-Amz-Signature=...",
    "objectKey": "uploads/unique-filename.jpg",
    "publicUrl": "https://pub-account-id.r2.dev/uploads/unique-filename.jpg",
    "filename": "unique-filename.jpg",
    "expiresIn": 3600
  }
}
```

### 直接上传文件（需要认证）

```bash
curl -X POST "$API_BASE/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/your/image.jpg"
```

### 获取上传文件列表（需要认证）

```bash
curl "$API_BASE/upload/uploads" \
  -H "Authorization: Bearer $TOKEN"
```

### 删除上传文件（需要认证）

```bash
curl -X DELETE "$API_BASE/upload/uploads/1" \
  -H "Authorization: Bearer $TOKEN"
```

## 6. 错误处理

所有 API 请求都会返回统一的响应格式：

### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息描述"
}
```

### 常见 HTTP 状态码
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未认证或 Token 无效
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 7. 完整测试流程

```bash
#!/bin/bash

# 1. 登录获取 Token
echo "🔐 登录获取 Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 2. 测试获取产品列表
echo "📦 获取产品列表..."
curl "$API_BASE/products"

# 3. 创建新产品
echo "➕ 创建新产品..."
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "测试产品",
    "summary": "这是一个测试产品",
    "price": 100.00,
    "category": "测试分类"
  }')

PRODUCT_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')
echo "创建的产品 ID: $PRODUCT_ID"

# 4. 获取单个产品
echo "🔍 获取产品详情..."
curl "$API_BASE/products/$PRODUCT_ID"

# 5. 更新产品
echo "✏️ 更新产品..."
curl -X PUT "$API_BASE/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "更新的测试产品"
  }'

# 6. 删除产品
echo "🗑️ 删除产品..."
curl -X DELETE "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"

echo "✅ 测试完成！"
```

## 8. 性能测试

使用 Apache Bench 进行简单的性能测试：

```bash
# 安装 ab
# Ubuntu/Debian: sudo apt-get install apache2-utils
# macOS: brew install apache2

# 测试 API 性能
ab -n 100 -c 10 "$API_BASE/products"

# 测试带认证的 API
ab -n 50 -c 5 -H "Authorization: Bearer $TOKEN" "$API_BASE/posts"
```

## 9. 监控和调试

### 查看实时日志
```bash
wrangler tail
```

### 测试数据库连接
```bash
wrangler d1 execute med-sales-db --command="SELECT COUNT(*) FROM products"
```

### 检查 Worker 部署状态
```bash
wrangler deploy --dry-run
```

---

**注意：** 请将示例中的 `your-worker-domain.workers.dev` 替换为实际的 Worker 域名，并将 `$TOKEN` 替换为有效的认证令牌。