# ⚡ 快速修复 - Cloudflare D1 Binding ID 错误

## 错误信息
```
✘ [ERROR] binding DB of type d1 must have a valid `id` specified [code: 10021]
```

## 快速解决 (3步)

### 1️⃣ 登录 Cloudflare
```bash
wrangler login
```

### 2️⃣ 运行配置脚本
```bash
chmod +x setup-resources.sh
./setup-resources.sh
```

### 3️⃣ 部署
```bash
npm run deploy
```

## 完成！ 🎉

---

## 如果不想用脚本（手动方式）

```bash
# 1. 创建数据库
wrangler d1 create med-sales-db

# 2. 记录输出的 database_id

# 3. 编辑 worker/wrangler.toml
# 找到: # database_id = ""
# 改为: database_id = "你的database_id"

# 4. 创建存储桶
wrangler r2 bucket create med-sales-images

# 5. 初始化数据库
cd worker
wrangler d1 execute med-sales-db --file=./schema.sql

# 6. 部署
wrangler deploy
```

---

## 更多帮助

- 📖 详细说明: [FIX_D1_BINDING_ID.md](FIX_D1_BINDING_ID.md)
- 🔧 故障排查: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- 🚀 完整指南: [ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md)

---

**问题已解决！** ✅
