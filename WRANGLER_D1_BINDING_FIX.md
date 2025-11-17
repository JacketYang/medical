# Wrangler D1 Database ID Binding 修复

## 问题概述

在使用 Cloudflare Pages 一键部署时，部署脚本会失败并显示以下错误：

```
✘ [ERROR] Processing wrangler.toml configuration:

    - "d1_databases[0]" bindings must have a "database_id" field but got {"binding":"DB","database_name":"med-sales-db"}.
```

这是因为 `wrangler.toml` 中的 D1 数据库绑定配置需要一个有效的 `database_id` 字段，而不能为空或注释掉。

## 根本原因

1. **原始配置问题**：`wrangler.toml` 中的 `database_id` 被注释掉了
2. **部署环境限制**：在 Cloudflare Pages 自动部署中，无法交互式运行脚本创建数据库
3. **缺少自动化处理**：没有机制在部署前自动配置数据库 ID

## 解决方案

我们实现了一个完整的解决方案，包括以下组件：

### 1. 预处理脚本：`scripts/prepare-wrangler-config.js`

这个脚本在部署前自动配置 D1 数据库 ID。支持三种获取 database_id 的方式（按优先级）：

```javascript
// 方式 1: 从环境变量读取
D1_DATABASE_ID=<your-id> npm run deploy

// 方式 2: 从现有 D1 数据库列表查询
node scripts/prepare-wrangler-config.js

// 方式 3: 自动创建新数据库（需要 Wrangler 认证）
wrangler login
node scripts/prepare-wrangler-config.js
```

**脚本功能**：
- ✅ 检查 `D1_DATABASE_ID` 环境变量
- ✅ 查询现有 D1 数据库
- ✅ 自动创建新数据库（可选）
- ✅ 更新 `wrangler.toml` 配置文件
- ✅ 处理多种配置格式

### 2. 构建脚本：`build.sh`

Cloudflare Pages 构建入口脚本，负责：

- ✅ 检测 Cloudflare Pages 环境
- ✅ 调用预处理脚本配置 D1 database ID
- ✅ 安装依赖
- ✅ 构建并部署 Worker
- ✅ 构建并部署前端

**用法**：
```bash
# 手动运行
./build.sh

# 或在 Cloudflare Pages 中配置为构建脚本
# 在构建设置中指定：Build command = ./build.sh
```

### 3. Worker 部署脚本更新：`worker/package.json`

```json
{
  "scripts": {
    "prebuild": "node ../scripts/prepare-wrangler-config.js",
    "deploy": "npm run prebuild && wrangler publish"
  }
}
```

现在 `npm run deploy` 会自动先运行预处理脚本。

### 4. 文档与指南

- **CLOUDFLARE_PAGES_SETUP.md** - Cloudflare Pages 部署详细指南
- **ONE_CLICK_DEPLOY.md** - 一键部署指南（已更新）
- **test-config.sh** - 测试脚本（已更新）

## 部署流程

### 方式 1：Cloudflare Pages 自动部署（推荐）

```bash
# 1. 创建 D1 数据库
wrangler d1 create med-sales-db
# 复制输出中的 database_id

# 2. 在 Cloudflare Pages 配置环境变量
# Settings > Build & deployments > Build configuration
# Environment variables > Add:
#   D1_DATABASE_ID = <your-database-id>

# 3. 连接 Git 并推送代码
# Cloudflare Pages 会自动检测到 build.sh 并执行部署
git push
```

### 方式 2：本地部署

```bash
# 设置环境变量
export D1_DATABASE_ID="<your-database-id>"

# 部署
npm run deploy
```

### 方式 3：使用自动化脚本

```bash
# 运行资源配置脚本
./setup-resources.sh

# 然后部署
npm run deploy
```

## 配置详解

### wrangler.toml 配置

```toml
[[d1_databases]]
binding = "DB"
database_name = "med-sales-db"
# database_id = "" # 取消注释并填写实际的D1数据库ID
```

- `binding` - 在代码中访问数据库的名称（`env.DB`）
- `database_name` - Cloudflare 中数据库的逻辑名称
- `database_id` - 数据库的唯一标识符（UUID）

### 环境变量配置

在 Cloudflare Pages 项目设置中添加：

| 变量名 | 说明 | 必需 |
|-------|------|------|
| `D1_DATABASE_ID` | D1 数据库的 UUID | ✅ |

## 测试脚本

运行测试脚本验证所有配置是否正确：

```bash
./test-config.sh
```

输出示例：
```
🧪 测试 Cloudflare Workers 部署配置...

📋 Step 1: 测试 Wrangler 配置预处理脚本...
✅ 找到预处理脚本
✅ 预处理脚本运行成功
✅ wrangler.toml 已正确更新

📋 Step 2: 测试根目录 wrangler.toml...
✅ 找到根目录 wrangler.toml
✅ database_id 正确注释（等待填写）

📋 Step 3: 测试 worker 目录 wrangler.toml...
✅ 找到 worker 目录 wrangler.toml
✅ database_id 正确注释（等待填写）
✅ Deploy 脚本正确配置了 prebuild

📋 Step 4: 测试数据库 ID 读取...
✅ 检测到 D1_DATABASE_ID 环境变量: d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b

🎉 配置测试完成！
```

## 故障排查

### 问题：部署仍然失败，显示 "database_id" 不存在

**检查点**：
1. 确认 `D1_DATABASE_ID` 环境变量已设置
2. 检查 database_id 格式是否为有效 UUID
3. 查看 Cloudflare Pages 构建日志

**解决方案**：
```bash
# 手动执行预处理脚本测试
D1_DATABASE_ID="<your-actual-id>" node scripts/prepare-wrangler-config.js

# 查看更新后的 wrangler.toml
grep database_id wrangler.toml worker/wrangler.toml
```

### 问题：脚本找不到 database_id

**原因**：可能是以下几种情况：
- 环境变量未设置
- 数据库不存在
- Wrangler 未认证

**解决方案**：
```bash
# 1. 确认登录
wrangler whoami

# 2. 创建数据库
wrangler d1 create med-sales-db

# 3. 列出现有数据库
wrangler d1 list

# 4. 设置环境变量并重试
export D1_DATABASE_ID="<id-from-list>"
npm run deploy
```

### 问题：Cloudflare Pages 部署超时

**可能原因**：
- 构建时间过长
- 网络连接问题
- 资源不足

**解决方案**：
- 增加 Pages 项目超时时间
- 优化构建脚本
- 检查网络连接

## 文件清单

修复包含以下新增和修改的文件：

### 新增文件
- `scripts/prepare-wrangler-config.js` - D1 database ID 预处理脚本
- `build.sh` - Cloudflare Pages 构建脚本
- `CLOUDFLARE_PAGES_SETUP.md` - Cloudflare Pages 部署指南
- `WRANGLER_D1_BINDING_FIX.md` - 本文件

### 修改文件
- `worker/package.json` - 添加 prebuild 脚本
- `ONE_CLICK_DEPLOY.md` - 更新部署指南
- `test-config.sh` - 增强测试功能

### 未改动文件
- `wrangler.toml` - 保持原样（需用户或脚本填写 database_id）
- `worker/wrangler.toml` - 保持原样（需用户或脚本填写 database_id）

## 实现细节

### 预处理脚本的工作流程

```
1. 检查 D1_DATABASE_ID 环境变量
   ├─ 如果存在，使用该值
   ├─ 否则，继续
   
2. 查询现有 D1 数据库列表
   ├─ 如果找到 med-sales-db，使用其 ID
   ├─ 否则，继续
   
3. 尝试自动创建新数据库
   ├─ 如果成功，使用返回的 ID
   ├─ 否则，显示错误提示
   
4. 使用获得的 database_id 更新 wrangler.toml
   ├─ 替换注释掉的 database_id 行
   ├─ 或更新现有的占位符
   
5. 验证更新成功
```

### 兼容性

- ✅ Node.js 14+
- ✅ Wrangler 3.x 和 4.x
- ✅ Windows、macOS、Linux
- ✅ Cloudflare Pages、GitHub Actions、本地环境

## 验证成功的标志

部署成功时会看到：

```
✅ Worker deployed successfully: https://medical-sales-worker.your-subdomain.workers.dev
✅ Frontend deployed successfully: https://medical-sales-frontend.pages.dev
✅ Admin panel: https://medical-sales-frontend.pages.dev/admin/login
```

检查部署是否成功：

```bash
# 1. 访问 Worker
curl https://medical-sales-worker.your-subdomain.workers.dev

# 2. 查看日志
wrangler tail

# 3. 查询数据库
wrangler d1 execute med-sales-db --command="SELECT 1"
```

## 相关文档

- [CLOUDFLARE_PAGES_SETUP.md](CLOUDFLARE_PAGES_SETUP.md) - Cloudflare Pages 详细指南
- [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md) - 一键部署指南
- [FIX_D1_BINDING_ID.md](FIX_D1_BINDING_ID.md) - 原始问题修复说明
- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署文档
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排查指南

## 更新历史

### v2.0 - Wrangler D1 Binding Fix (2025-11-17)

**改进**：
- ✅ 添加自动 database_id 配置脚本
- ✅ 创建 Cloudflare Pages 专用构建脚本
- ✅ 改进 Worker 部署流程
- ✅ 完善测试和验证机制
- ✅ 新增详细的 Cloudflare Pages 部署指南

**兼容性**：
- ✅ 向后兼容现有部署方式
- ✅ 支持多种 database_id 获取方式
- ✅ 支持 Cloudflare Pages、GitHub Actions、本地部署

---

**问题已解决** ✅

如有任何问题，请参考相关文档或提交 Issue。
