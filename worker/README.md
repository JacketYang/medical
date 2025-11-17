# 医疗器械销售官网 - 后端 Worker

这是一个基于 Cloudflare Workers + D1 + R2 的后端API服务，为医疗器械销售官网提供完整的REST API。

## 功能特性

- JWT认证系统
- 产品CRUD管理
- 新闻/文章管理
- 站点设置管理
- R2图片上传
- 分页和搜索支持
- CORS支持

## 本地开发

```bash
# 安装依赖
npm install

# 创建D1数据库
wrangler d1 create med-sales-db

# 创建R2存储桶
wrangler r2 bucket create med-sales-images

# 设置环境变量
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD

# 运行数据库迁移
wrangler d1 execute med-sales-db --file=./schema.sql

# 本地开发
wrangler dev
```

## 部署

```bash
# 部署到Cloudflare Workers
wrangler publish
```

## API文档

- `POST /api/auth/login` - 用户登录
- `GET /api/products` - 获取产品列表
- `GET /api/products/:id` - 获取产品详情
- `POST /api/products` - 创建产品（需认证）
- `PUT /api/products/:id` - 更新产品（需认证）
- `DELETE /api/products/:id` - 删除产品（需认证）
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 创建文章（需认证）
- `PUT /api/posts/:id` - 更新文章（需认证）
- `DELETE /api/posts/:id` - 删除文章（需认证）
- `GET /api/settings` - 获取站点设置
- `PUT /api/settings` - 更新站点设置（需认证）
- `POST /api/upload-url` - 获取图片上传URL（需认证）