# 🚀 快速开始指南

## 🎯 推荐：GitHub 一键部署

### 第一步：Fork 项目
1. 访问项目 GitHub 页面
2. 点击右上角 "Fork" 按钮
3. 选择 Fork 到您的账户

### 第二步：配置 Cloudflare
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 获取 API Token（权限：D1:Edit, R2:Edit, Zone:Read）
3. 获取 Account ID

### 第三步：设置 GitHub Secrets
在您 Fork 的仓库中设置：
- `CLOUDFLARE_API_TOKEN`: 您的 API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID
- `API_URL`: Worker API 地址（部署后获取）

### 第四步：一键部署
1. 进入仓库的 Actions 页面
2. 选择 "Deploy to Cloudflare" 工作流
3. 点击 "Run workflow" 开始部署
4. 等待部署完成

## 📦 本地一键部署

如果您已经配置好了 Cloudflare 账户和必要的环境变量，可以直接运行：

```bash
./deploy.sh
```

## 手动部署步骤

### 1. 准备 Cloudflare 资源

```bash
# 登录 Cloudflare
wrangler login

# 创建数据库
wrangler d1 create med-sales-db

# 创建存储桶
wrangler r2 bucket create med-sales-images
```

### 2. 配置后端

```bash
cd worker

# 配置 wrangler.toml 中的数据库 ID 和存储桶名称

# 设置环境变量
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD

# 初始化数据库
wrangler d1 execute med-sales-db --file=./schema.sql
wrangler d1 execute med-sales-db --file=./seed.sql

# 部署 Worker
npm install
wrangler publish
```

### 3. 部署前端

```bash
cd frontend

# 配置 API 地址
echo "VITE_API_URL=https://your-worker-domain.workers.dev/api" > .env.production

# 构建和部署
npm install
npm run build
wrangler pages deploy dist --project-name=medical-sales-frontend
```

## 访问网站

部署完成后，您可以：

- **前端网站:** `https://medical-sales-frontend.pages.dev`
- **管理后台:** `https://medical-sales-frontend.pages.dev/admin/login`
- **API 文档:** 参考 `API_TESTING.md`

## 默认账号

- **用户名:** `admin`
- **密码:** `admin123`

> ⚠️ **重要:** 首次登录后请立即修改密码！

## 开发模式

### 后端开发
```bash
cd worker
wrangler dev
```

### 前端开发
```bash
cd frontend
npm run dev
```

## 常见问题

### 1. Worker 部署失败
```bash
# 检查配置
wrangler whoami
wrangler deploy --dry-run
```

### 2. 数据库连接错误
```bash
# 验证数据库绑定
wrangler d1 list
wrangler d1 execute med-sales-db --command="SELECT 1"
```

### 3. 前端构建失败
```bash
# 清理依赖
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 技术支持

- 📖 详细文档: `README.md`
- 🚀 部署指南: `DEPLOYMENT.md`
- 🧪 API 测试: `API_TESTING.md`
- 📋 项目交付: `PROJECT_HANDOVER.md`

---

**🎉 祝您使用愉快！**