# Cloudflare Pages 部署配置指南

本指南说明如何在 Cloudflare Pages 中正确配置和部署本项目。

## 问题背景

在一键部署到 Cloudflare Pages 时，可能会遇到以下错误：

```
✘ [ERROR] Processing wrangler.toml configuration:
  - "d1_databases[0]" bindings must have a "database_id" field
```

这是因为 D1 数据库的 ID 需要在 `wrangler.toml` 中指定，而在首次部署时数据库可能还不存在。

## 解决方案

### 第一步：创建 D1 数据库

在部署前，需要先创建 D1 数据库。您有两种选择：

#### 选项 A：本地创建（推荐）

如果您已经安装了 Wrangler CLI，可以本地创建：

```bash
# 登录 Cloudflare
wrangler login

# 创建数据库
wrangler d1 create med-sales-db

# 复制输出中的 database_id，例如：
# database_id = "d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b"
```

#### 选项 B：通过 Cloudflare Dashboard 创建

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers → D1
3. 点击 "Create Database"
4. 输入名称：`med-sales-db`
5. 复制生成的 Database ID

### 第二步：配置 Cloudflare Pages 环境变量

1. 进入您的 Cloudflare Pages 项目设置
2. 导航到 "Settings" → "Build & deployments"
3. 在 "Build configuration" 中找到 "Environment variables"
4. 添加以下环境变量：

| Variable Name | Value |
|---------------|-------|
| `D1_DATABASE_ID` | 第一步中复制的数据库 ID |

### 第三步：配置构建脚本

如果还未配置，请设置以下构建参数：

1. **Build command**: 
   ```bash
   npm run build
   ```

2. **Build output directory**: 
   ```
   (或保持为空，系统会自动处理)
   ```

3. **Root directory (optional)**: 
   ```
   /
   ```

### 第四步：连接 Git 仓库并部署

1. 在 Cloudflare Pages 中连接您的 Git 仓库
2. 选择正确的分支（通常是 main）
3. 系统会自动检测并运行部署
4. 部署时会自动：
   - 运行 `prepare-wrangler-config.js` 脚本
   - 使用 `D1_DATABASE_ID` 环境变量更新 `wrangler.toml`
   - 构建并部署 Worker
   - 构建并部署前端

## 构建脚本说明

部署时执行的构建流程：

```
1. 预处理 Wrangler 配置
   └─ 读取 D1_DATABASE_ID 环境变量
   └─ 更新 wrangler.toml 中的 database_id

2. 安装依赖
   └─ npm ci (根目录)
   └─ npm ci (worker 目录)
   └─ npm ci (frontend 目录)

3. 构建并部署 Worker
   └─ 运行 npm run deploy

4. 构建前端
   └─ npm run build

5. 部署完成
```

## 脚本文件说明

### scripts/prepare-wrangler-config.js

这个脚本负责在部署前配置 D1 数据库 ID。它会：

1. 检查 `D1_DATABASE_ID` 环境变量
2. 如果找到，自动更新 `wrangler.toml` 文件
3. 支持多种数据库 ID 获取方式：
   - 环境变量 `D1_DATABASE_ID`
   - 现有 D1 数据库列表
   - 自动创建新数据库（需要 Wrangler 认证）

### build.sh

这是 Cloudflare Pages 的构建入口脚本，负责：

1. 检测 Cloudflare Pages 环境
2. 预处理 Wrangler 配置
3. 安装依赖
4. 构建并部署应用

## 故障排查

### 问题：部署时仍然报告找不到 database_id

**解决方案：**

1. 确认 `D1_DATABASE_ID` 环境变量已正确设置
2. 在 Cloudflare Pages 项目设置中查看构建日志
3. 查看是否有其他错误信息

### 问题：数据库 ID 格式不对

**解决方案：**

确保 Database ID 格式为 UUID，例如：
```
d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b
```

### 问题：Worker 部署成功但数据库连接失败

**解决方案：**

1. 初始化数据库结构：
   ```bash
   wrangler d1 execute med-sales-db --file=./worker/schema.sql
   ```

2. 导入种子数据（可选）：
   ```bash
   wrangler d1 execute med-sales-db --file=./worker/seed.sql
   ```

## 本地部署测试

在提交到 Cloudflare Pages 前，可以本地测试部署流程：

```bash
# 设置环境变量
export D1_DATABASE_ID="your-actual-database-id"

# 运行部署脚本
npm run deploy

# 或直接运行预处理脚本
node scripts/prepare-wrangler-config.js
```

## 环境变量参考

### 可用的环境变量

| Variable | 说明 | 必需 | 来源 |
|----------|------|------|------|
| `D1_DATABASE_ID` | D1 数据库 ID | ✅ | Cloudflare Pages 项目设置 |
| `CF_PAGES_COMMIT_SHA` | Git 提交 SHA | ❌ | Cloudflare Pages 自动提供 |
| `CF_PAGES` | Cloudflare Pages 标识 | ❌ | Cloudflare Pages 自动提供 |

## 相关文档

- [D1 数据库绑定 ID 问题修复](FIX_D1_BINDING_ID.md)
- [一键部署指南](ONE_CLICK_DEPLOY.md)
- [完整部署文档](DEPLOYMENT.md)
- [项目交付文档](PROJECT_HANDOVER.md)

## 获取帮助

如果遇到问题，请：

1. 查看 Cloudflare Pages 构建日志
2. 参考 [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. 检查 Wrangler 配置是否正确
4. 确认 Cloudflare API Token 权限足够
