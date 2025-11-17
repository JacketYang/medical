# D1 Database ID 绑定修复 - Worker 部署

## 快速说明

如果你在部署 Cloudflare Worker 时遇到以下错误：

```
✘ [ERROR] Processing wrangler.toml configuration:
  - "d1_databases[0]" bindings must have a "database_id" field
```

**解决方案只需 3 步：**

### 第 1 步：获取或创建 D1 数据库

```bash
# 列出现有数据库
wrangler d1 list

# 或创建新数据库
wrangler d1 create med-sales-db
```

记住输出中的 `database_id`。

### 第 2 步：设置环境变量

```bash
export D1_DATABASE_ID="your-database-id-here"
```

### 第 3 步：部署

```bash
npm run deploy
```

**完成！** ✅

## 工作原理

- `worker/package.json` 中的 `deploy` 脚本现在会自动运行 `prebuild`
- `prebuild` 脚本运行 `scripts/prepare-wrangler-config.js`
- 这个脚本使用你的 `D1_DATABASE_ID` 环境变量自动配置 `wrangler.toml`
- 然后 Wrangler 部署成功

## 高级用法

### 在 GitHub Actions 中使用

在你的 GitHub 仓库 Secrets 中添加：
- `D1_DATABASE_ID` - 你的数据库 ID

在 GitHub Actions 工作流中：
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      D1_DATABASE_ID: ${{ secrets.D1_DATABASE_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 在其他 CI/CD 系统中使用

只需设置环境变量 `D1_DATABASE_ID` 然后运行 `npm run deploy` 即可。

## 常见问题

**Q: 我该在哪里找到 database_id？**
A: 运行 `wrangler d1 list` 查看所有数据库及其 ID。

**Q: 脚本会修改我的 wrangler.toml 吗？**
A: 是的，但只是临时的。在部署完成后，你可以用 `git checkout` 恢复原始文件。

**Q: 我能在本地开发中使用这个吗？**
A: 可以的。设置 `D1_DATABASE_ID` 环境变量后，运行 `npm run deploy` 即可。

**Q: 这个修复对前端部署有影响吗？**
A: 没有。这只影响 Worker 部分。前端部署方式不变。

## 相关文档

完整的技术文档可在以下文件中找到：

- **[WORKER_DEPLOYMENT_FIX.md](WORKER_DEPLOYMENT_FIX.md)** - Worker 部署详细指南（推荐阅读）
- [FIX_D1_BINDING_ID.md](FIX_D1_BINDING_ID.md) - 问题分析和原始修复
- [FIX_SUMMARY.md](FIX_SUMMARY.md) - 完整修复总结
- [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md) - 一键部署指南
- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署文档

## 修复内容

### 新增文件
- `scripts/prepare-wrangler-config.js` - 自动 database_id 配置脚本

### 修改文件
- `worker/package.json` - 添加 `prebuild` 脚本

### 无需改动
- `wrangler.toml` - 保持原样（脚本自动处理）
- `worker/wrangler.toml` - 保持原样（脚本自动处理）

## 下一步

1. 阅读 [WORKER_DEPLOYMENT_FIX.md](WORKER_DEPLOYMENT_FIX.md) 获得详细说明
2. 设置 `D1_DATABASE_ID` 环境变量
3. 运行 `npm run deploy` 部署
4. 验证部署成功

---

**有问题？** 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 或相关文档。
