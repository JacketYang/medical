# Cloudflare Worker D1 Database ID 绑定修复

## 问题说明

在部署 Cloudflare Worker 时，遇到以下错误：

```
✘ [ERROR] Processing wrangler.toml configuration:
  - "d1_databases[0]" bindings must have a "database_id" field but got {"binding":"DB","database_name":"med-sales-db"}.
```

## 原因分析

Wrangler 部署时需要在 `wrangler.toml` 中指定有效的 D1 `database_id`。原始配置将其注释掉了，导致验证失败。

## 解决方案

### 核心修复：预处理脚本

创建了 `scripts/prepare-wrangler-config.js` 脚本，在部署前自动配置 database_id。

### 使用方法

#### 方式 1：设置环境变量（推荐）

```bash
# 1. 获取你的 D1 database_id
wrangler d1 list
# 查找 med-sales-db 的 ID

# 2. 设置环境变量
export D1_DATABASE_ID="your-actual-database-id"

# 3. 部署
npm run deploy
```

#### 方式 2：自动脚本配置

```bash
# 脚本会自动查询并配置
node scripts/prepare-wrangler-config.js

# 然后部署
npm run deploy
```

#### 方式 3：完整自动化设置

```bash
# 使用已有的设置脚本（创建数据库并配置）
./setup-resources.sh

# 然后部署
npm run deploy
```

### 工作流程

```
1. npm run deploy 执行
   ↓
2. worker/package.json 中的 deploy 脚本运行
   ├─ npm run prebuild (调用 prepare-wrangler-config.js)
   └─ wrangler publish (Wrangler 部署)
   ↓
3. prepare-wrangler-config.js 检查：
   ├─ 检查 D1_DATABASE_ID 环境变量
   ├─ 查询现有 D1 数据库
   └─ 尝试创建新数据库（如果需要）
   ↓
4. 更新 wrangler.toml 中的 database_id
   ↓
5. wrangler publish 部署成功
```

## 文件改动

### 新增文件
- `scripts/prepare-wrangler-config.js` - D1 database_id 自动配置脚本

### 修改文件
- `worker/package.json` - 添加 `prebuild` 脚本到 `deploy` 命令

## 快速开始

### 第一步：创建 D1 数据库

```bash
# 如果还没有创建数据库
wrangler d1 create med-sales-db

# 复制输出中的 database_id
# 例如：d4e2f3e8-8c4a-4b2c-b9d2-1f8e5c2d3a4b
```

### 第二步：配置环境变量

```bash
export D1_DATABASE_ID="your-database-id-from-above"
```

### 第三步：部署

```bash
npm run deploy
```

完成！Worker 会自动配置数据库绑定并部署。

## 环境变量配置

对于不同的部署环境，可以设置相应的 `D1_DATABASE_ID`：

- **本地开发**：
  ```bash
  export D1_DATABASE_ID="dev-database-id"
  npm run deploy
  ```

- **GitHub Actions**：
  在 GitHub 仓库的 Secrets 中添加 `D1_DATABASE_ID`

- **CI/CD 系统**：
  设置构建环境变量 `D1_DATABASE_ID`

## 故障排查

### 问题：脚本找不到 database_id

**解决方案**：
```bash
# 确保已设置环境变量
echo $D1_DATABASE_ID

# 如果为空，设置它
export D1_DATABASE_ID="your-actual-id"

# 验证配置
node scripts/prepare-wrangler-config.js
```

### 问题：部署时仍然报错

**检查清单**：
1. ✅ D1 数据库是否已创建？`wrangler d1 list`
2. ✅ `D1_DATABASE_ID` 环境变量是否已设置？`echo $D1_DATABASE_ID`
3. ✅ 数据库 ID 格式是否正确（UUID）？
4. ✅ 是否已运行 `npm ci` 安装依赖？

**解决步骤**：
```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 创建数据库
wrangler d1 create med-sales-db

# 3. 复制 database_id 并设置环境变量
export D1_DATABASE_ID="<from-above>"

# 4. 验证配置
node scripts/prepare-wrangler-config.js

# 5. 查看更新结果
grep database_id worker/wrangler.toml

# 6. 恢复原始文件
git checkout worker/wrangler.toml

# 7. 再次设置环境变量并部署
export D1_DATABASE_ID="<your-id>"
npm run deploy
```

## 工作原理

### scripts/prepare-wrangler-config.js

这个脚本在部署前自动处理 database_id 配置：

```javascript
// 优先级：
// 1. 检查 D1_DATABASE_ID 环境变量
// 2. 查询现有 D1 数据库列表
// 3. 尝试创建新数据库
// 4. 更新 wrangler.toml 中的 database_id
```

### worker/package.json 修改

```json
{
  "scripts": {
    "prebuild": "node ../scripts/prepare-wrangler-config.js",
    "deploy": "npm run prebuild && wrangler publish"
  }
}
```

这样 `npm run deploy` 会自动：
1. 先运行预处理脚本配置 database_id
2. 再运行 Wrangler 部署

## 验证部署成功

部署成功后，你会看到：

```
✅ Wrangler configuration ready for deployment
✅ Published worker successfully
```

验证数据库连接：

```bash
# 检查 Worker 状态
wrangler tail

# 查询数据库
wrangler d1 execute med-sales-db --command="SELECT 1"
```

## 相关文档

- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署指南
- [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md) - 一键部署指南
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排查指南
- [FIX_D1_BINDING_ID.md](FIX_D1_BINDING_ID.md) - 原始问题修复说明
- [FIX_SUMMARY.md](FIX_SUMMARY.md) - 完整的修复总结

## 总结

这个修复通过以下方式解决了 D1 binding ID 问题：

✅ **自动化配置**：无需手动编辑 wrangler.toml
✅ **环境变量支持**：支持 CI/CD 环境配置
✅ **灵活部署**：支持本地、GitHub Actions、其他 CI/CD
✅ **向后兼容**：现有部署方式仍然有效
✅ **详细日志**：清晰的错误提示和恢复指南

---

**现在你可以成功部署你的 Cloudflare Worker 了！** 🚀
