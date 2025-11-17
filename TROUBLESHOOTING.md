# 🔧 故障排查指南

本文档提供常见问题的解决方案，帮助您快速解决部署和运行中遇到的问题。

## 🚨 常见错误

### 1. D1 数据库 binding ID 错误 (code: 10021)

**错误信息**：
```
✘ [ERROR] A request to the Cloudflare API (/accounts/.../workers/scripts/.../versions) failed.

  binding DB of type d1 must have a valid `id` specified [code: 10021]
  To learn more about this error, visit: https://developers.cloudflare.com/workers/observability/errors/#validation-errors-10021
```

**原因**：
- `wrangler.toml` 配置文件中的 `database_id` 未设置或使用了占位符值
- D1 数据库尚未创建

**解决方案**：

#### 方法 1：使用自动化脚本（推荐）

```bash
# 运行资源配置脚本
chmod +x setup-resources.sh
./setup-resources.sh
```

脚本会自动：
- 创建 D1 数据库
- 获取 database_id
- 更新 wrangler.toml 配置
- 初始化数据库结构

#### 方法 2：手动配置

```bash
# 1. 创建 D1 数据库
wrangler d1 create med-sales-db

# 输出示例：
# ✅ Successfully created DB 'med-sales-db'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "med-sales-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 2. 复制 database_id，编辑 worker/wrangler.toml
# 找到这一行：
# database_id = "" # 取消注释并填写实际的D1数据库ID

# 修改为：
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# 3. 创建 R2 存储桶
wrangler r2 bucket create med-sales-images

# 4. 初始化数据库
wrangler d1 execute med-sales-db --file=./worker/schema.sql
wrangler d1 execute med-sales-db --file=./worker/seed.sql
```

---

### 2. Wrangler 配置文件找不到

**错误信息**：
```
❌ Could not find wrangler.toml file
```

**原因**：
- 在错误的目录执行命令
- 项目结构不正确

**解决方案**：

```bash
# 确认当前在项目根目录
pwd
# 应该显示: /path/to/medical-sales-website

# 检查 wrangler.toml 是否存在
ls -la worker/wrangler.toml

# 从根目录部署
npm run deploy

# 或进入 worker 目录部署
cd worker
wrangler deploy
```

---

### 3. R2 存储桶不存在

**错误信息**：
```
The bucket 'med-sales-images' does not exist
```

**解决方案**：

```bash
# 创建 R2 存储桶
wrangler r2 bucket create med-sales-images

# 验证创建成功
wrangler r2 bucket list
```

---

### 4. JWT Secret 未设置

**错误信息**：
```
Error: JWT_SECRET is not configured
```

**解决方案**：

```bash
# 设置 JWT Secret
wrangler secret put JWT_SECRET
# 输入一个安全的密钥（建议至少 32 字符）

# 设置管理员用户名
wrangler secret put ADMIN_USERNAME
# 输入: admin

# 设置管理员密码
wrangler secret put ADMIN_PASSWORD
# 输入一个强密码
```

---

### 5. 数据库表不存在

**错误信息**：
```
no such table: products
```

**原因**：
- 数据库结构未初始化

**解决方案**：

```bash
# 执行数据库迁移
wrangler d1 execute med-sales-db --file=./worker/schema.sql

# 导入种子数据（可选）
wrangler d1 execute med-sales-db --file=./worker/seed.sql

# 验证表已创建
wrangler d1 execute med-sales-db --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

### 6. CORS 跨域错误

**错误信息**：
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决方案**：

1. **检查 API 地址配置**：
   ```bash
   # 前端 .env 文件
   echo "VITE_API_URL=https://your-worker-domain.workers.dev/api" > frontend/.env.production
   ```

2. **验证 Worker 中的 CORS 设置**：
   Worker 代码应该包含正确的 CORS 头部配置。

---

### 7. GitHub Actions 部署失败

**错误信息**：
```
Error: Authentication error
```

**解决方案**：

1. **验证 GitHub Secrets**：
   - 进入仓库 Settings → Secrets and variables → Actions
   - 确认以下 Secrets 已正确配置：
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`
     - `API_URL`

2. **检查 API Token 权限**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "My Profile" → "API Tokens"
   - 确认 Token 具有以下权限：
     - Account: Cloudflare D1:Edit
     - Account: Cloudflare R2:Edit
     - Zone: Zone:Read
     - Account: Account Settings:Read

3. **重新创建 API Token**（如果需要）：
   - 删除旧的 Token
   - 创建新的 Custom Token
   - 更新 GitHub Secrets

---

### 8. 前端构建失败

**错误信息**：
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**解决方案**：

```bash
# 清理并重新安装依赖
cd frontend
rm -rf node_modules package-lock.json
npm install

# 检查 Node.js 版本（需要 18+）
node --version

# 重新构建
npm run build

# 检查构建输出
ls -la dist/
```

---

### 9. 图片上传失败

**错误信息**：
```
Failed to upload image to R2
```

**解决方案**：

1. **验证 R2 存储桶绑定**：
   ```bash
   # 检查 wrangler.toml 配置
   cat worker/wrangler.toml | grep -A 3 "r2_buckets"
   
   # 应该看到：
   # [[r2_buckets]]
   # binding = "IMAGES"
   # bucket_name = "med-sales-images"
   ```

2. **确认存储桶存在**：
   ```bash
   wrangler r2 bucket list
   ```

3. **检查文件大小限制**：
   - 默认限制通常为 5MB
   - 如需上传更大文件，需要调整配置

---

### 10. 部署成功但无法访问

**症状**：
- 部署显示成功
- 访问 URL 返回 404 或错误

**解决方案**：

1. **检查 Worker URL**：
   ```bash
   # 查看部署的 Worker URL
   wrangler deployments list
   ```

2. **验证路由配置**：
   ```bash
   # 测试 API 端点
   curl https://your-worker-domain.workers.dev/api/health
   ```

3. **检查日志**：
   ```bash
   # 实时查看 Worker 日志
   wrangler tail
   ```

4. **验证数据库连接**：
   ```bash
   # 测试数据库查询
   wrangler d1 execute med-sales-db --command="SELECT COUNT(*) FROM products"
   ```

---

## 🔍 调试技巧

### 1. 查看 Worker 日志

```bash
# 实时日志
wrangler tail

# 带过滤的日志
wrangler tail --format pretty

# 查看特定时间段的日志
wrangler tail --since 10m
```

### 2. 本地开发调试

```bash
# 启动本地开发服务器
cd worker
wrangler dev

# 使用本地数据库
wrangler dev --local

# 指定端口
wrangler dev --port 8788
```

### 3. 测试数据库操作

```bash
# 列出所有数据库
wrangler d1 list

# 查询数据
wrangler d1 execute med-sales-db --command="SELECT * FROM products LIMIT 5"

# 执行 SQL 文件
wrangler d1 execute med-sales-db --file=./test-query.sql

# 导出数据
wrangler d1 export med-sales-db --output=backup.sql
```

### 4. 检查配置

```bash
# 验证 Wrangler 配置
wrangler deploy --dry-run

# 查看账户信息
wrangler whoami

# 列出 Workers
wrangler deployments list

# 查看环境变量
wrangler secret list
```

---

## 📚 相关文档

- [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md) - 一键部署指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 详细部署文档
- [API_TESTING.md](API_TESTING.md) - API 测试指南
- [QUICK_START.md](QUICK_START.md) - 快速开始
- [README.md](README.md) - 项目概览

---

## 💬 获取帮助

如果以上解决方案都无法解决您的问题：

1. **查看官方文档**：
   - [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
   - [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
   - [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)

2. **提交 Issue**：
   - 在 GitHub 仓库提交 Issue
   - 包含错误信息、配置文件和操作步骤

3. **社区支持**：
   - [Cloudflare Community](https://community.cloudflare.com/)
   - [GitHub Discussions](../../discussions)

---

**最后更新**: 2024-11-17
