# 医疗器械销售官网 - 部署指南

本文档详细说明了如何部署医疗器械销售官网项目，包括后端Worker和前端应用。

## 项目结构

```
medical-sales-website/
├── worker/                 # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts       # Worker 入口文件
│   │   ├── routes/        # API 路由
│   │   ├── db.ts          # 数据库操作
│   │   └── utils.ts       # 工具函数
│   ├── schema.sql         # 数据库表结构
│   ├── seed.sql          # 种子数据
│   ├── wrangler.toml     # Worker 配置
│   └── package.json
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 公共组件
│   │   ├── api/          # API 封装
│   │   └── hooks/        # 自定义 Hooks
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 部署前准备

### 1. 安装工具

```bash
# 安装 Node.js (推荐 v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 准备 Cloudflare 资源

```bash
# 创建 D1 数据库
wrangler d1 create med-sales-db

# 创建 R2 存储桶
wrangler r2 bucket create med-sales-images

# 记录返回的 ID，稍后配置使用
```

## 后端部署 (Cloudflare Workers)

### 1. 配置 wrangler.toml

编辑 `worker/wrangler.toml`，替换占位符：

```toml
name = "medical-sales-worker"
main = "src/index.ts"
compatibility_date = "2023-12-01"

# D1数据库绑定
[[d1_databases]]
binding = "DB"
database_name = "med-sales-db"
database_id = "your-actual-d1-database-id"  # 替换为实际的数据库ID

# R2存储桶绑定
[[r2_buckets]]
binding = "IMAGES"
bucket_name = "med-sales-images"  # 替换为实际的存储桶名称

# 环境变量
[vars]
API_VERSION = "v1"
```

### 2. 设置环境密钥

```bash
# 设置 JWT 密钥
wrangler secret put JWT_SECRET
# 输入: your-super-secret-jwt-key-here

# 设置管理员账号
wrangler secret put ADMIN_USERNAME
# 输入: admin

# 设置管理员密码
wrangler secret put ADMIN_PASSWORD
# 输入: your-secure-password-here

# 设置 R2 访问密钥（如果需要）
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY

# 设置 Cloudflare 账户 ID
wrangler secret put ACCOUNT_ID
# 输入: your-cloudflare-account-id
```

### 3. 初始化数据库

```bash
cd worker

# 创建表结构
wrangler d1 execute med-sales-db --file=./schema.sql

# 导入种子数据
wrangler d1 execute med-sales-db --file=./seed.sql
```

### 4. 部署 Worker

```bash
# 安装依赖
npm install

# 部署到 Cloudflare Workers
wrangler publish

# 验证部署
curl https://medical-sales-worker.your-subdomain.workers.dev/
```

### 5. 配置自定义域名（可选）

```bash
# 绑定自定义域名
wrangler custom-domains add api.yourdomain.com

# 或在 wrangler.toml 中配置路由
# [routes]
# pattern = "api.yourdomain.com/*"
# zone_name = "yourdomain.com"
```

## 前端部署 (Cloudflare Pages)

### 1. 配置前端应用

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
echo "VITE_API_URL=https://api.yourdomain.com" > .env.production
```

### 2. 构建前端应用

```bash
# 构建生产版本
npm run build

# 本地预览
npm run preview
```

### 3. 部署到 Cloudflare Pages

#### 方法1: 通过 Wrangler 部署

```bash
# 部署到 Pages
wrangler pages deploy dist --project-name=medical-sales-frontend

# 绑定自定义域名
wrangler pages project create medical-sales-frontend --production-branch main
```

#### 方法2: 通过 Git 仓库部署

1. 将前端代码推送到 Git 仓库
2. 在 Cloudflare Dashboard 中创建 Pages 项目
3. 连接 Git 仓库，配置构建命令：
   - 构建命令: `npm run build`
   - 输出目录: `dist`
   - Node.js 版本: `18`

### 4. 配置域名

在 Cloudflare Pages 项目设置中：
- 添加自定义域名
- 配置 DNS 记录
- 设置 SSL 证书

## 本地开发

### 1. 后端本地开发

```bash
cd worker

# 启动本地开发服务器
wrangler dev

# 在另一个终端测试 API
curl http://localhost:8787/api/products
```

### 2. 前端本地开发

```bash
cd frontend

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# API 请求会自动代理到 http://localhost:8787
```

## 安全配置

### 1. CORS 配置

在 `worker/src/index.ts` 中配置允许的前端域名：

```typescript
app.use('*', cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### 2. 文件上传限制

在 `worker/src/routes/upload.ts` 中配置：

```typescript
// 文件类型限制
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

// 文件大小限制（5MB）
const maxSize = 5 * 1024 * 1024;
```

### 3. JWT 配置

定期更换 JWT 密钥：

```bash
wrangler secret put JWT_SECRET
# 输入新的密钥
```

## 监控和维护

### 1. 日志监控

```bash
# 实时查看 Worker 日志
wrangler tail

# 查看 Pages 部署日志
# 在 Cloudflare Dashboard 中查看
```

### 2. 数据库备份

```bash
# 导出数据库
wrangler d1 export med-sales-db --output=backup.sql

# 导入数据库（恢复）
wrangler d1 execute med-sales-db --file=backup.sql
```

### 3. 性能监控

- 使用 Cloudflare Analytics 监控 API 性能
- 配置 Web Analytics 监控前端访问
- 设置告警规则

## 常见问题

### 1. Worker 部署失败

```bash
# 检查 wrangler.toml 配置
wrangler whoami

# 检查权限
wrangler deploy --dry-run
```

### 2. 数据库连接错误

```bash
# 验证 D1 绑定
wrangler d1 list

# 测试数据库连接
wrangler d1 execute med-sales-db --command="SELECT 1"
```

### 3. R2 上传失败

```bash
# 检查 R2 权限
wrangler r2 bucket list

# 验证访问密钥
wrangler secret list
```

### 4. 前端构建失败

```bash
# 清理依赖
rm -rf node_modules package-lock.json
npm install

# 检查 Node.js 版本
node --version  # 应该是 18+
```

## 成本估算

### Cloudflare Workers
- 免费：100,000 请求/天
- 付费：$0.50/百万请求

### D1 数据库
- 免费：5GB 存储，2500万读取/月，10万写入/月
- 付费：$0.25/GB/月，$0.50/百万读取

### R2 存储
- 免费：10GB 存储，100万 A类操作/月
- 付费：$0.015/GB/月，$4.50/百万 A类操作

### Cloudflare Pages
- 免费：500 次构建/月
- 付费：5/月

**估算月成本**：$5-20（中等流量网站）

## 技术支持

如遇到问题，请参考：

1. [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
3. [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
4. [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

## 下一步

部署完成后，建议：

1. 配置域名和 SSL
2. 设置监控和告警
3. 配置自动备份
4. 进行性能测试
5. 制定维护计划

---

**注意事项**：
- 在生产环境中，请使用强密码和安全的 JWT 密钥
- 定期更新依赖包
- 监控 API 使用量和费用
- 保持数据库备份