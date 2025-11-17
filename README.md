# 医疗器械销售官网

一个基于 Cloudflare Workers + D1 + R2 + React 的现代化医疗器械销售网站，支持前后端分离架构。

## 🌟 项目特色

- **🚀 现代化技术栈**: Cloudflare Workers + D1 + R2 + React + TypeScript + Tailwind CSS
- **📱 响应式设计**: 完美适配桌面端和移动端
- **🔐 安全认证**: JWT 认证系统，保护管理后台
- **📸 图片上传**: R2 云存储，支持图片上传和管理
- **🔍 SEO 优化**: 服务端渲染支持，搜索引擎友好
- **⚡ 高性能**: 全球 CDN 加速，毫秒级响应
- **💰 成本低廉**: Cloudflare 免费套餐即可支撑中等流量

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │────│  API (Workers)  │────│  数据库 (D1)    │
│                 │    │                 │    │                 │
│ • 用户界面      │    │ • REST API      │    │ • 产品数据      │
│ • SEO 优化      │    │ • JWT 认证      │    │ • 文章数据      │
│ • 响应式设计    │    │ • 文件上传      │    │ • 用户数据      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌─────────────────┐
                       │  存储 (R2)      │
                       │                 │
                       │ • 图片文件      │
                       │ • 静态资源      │
                       └─────────────────┘
```

## 🚀 一键部署

> **✅ 问题已修复**: 项目现在支持从根目录进行一键部署，解决了"找不到 wrangler 配置文件"的问题。

### 🎯 推荐：GitHub Actions 一键部署

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/JacketYang/medical)

[![Fork](https://img.shields.io/github/forks/YOUR_USERNAME/medical-sales-website?style=social)](https://github.com/YOUR_USERNAME/medical-sales-website/fork)
[![Stars](https://img.shields.io/github/stars/YOUR_USERNAME/medical-sales-website?style=social)](https://github.com/YOUR_USERNAME/medical-sales-website)

<details>
<summary>📖 查看一键部署指南</summary>

### 前置条件

1. **Fork 项目**：点击页面右上角的 "Fork" 按钮
2. **获取 Cloudflare API Token**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "My Profile" → "API Tokens"
   - 创建 Custom Token，权限包括：D1:Edit, R2:Edit, Zone:Read
3. **配置 GitHub Secrets**：
   - 在您 Fork 的仓库中设置：
     - `CLOUDFLARE_API_TOKEN`: 您的 API Token
     - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账户 ID

### 部署步骤

1. 进入您 Fork 仓库的 Actions 页面
2. 选择 "Deploy to Cloudflare" 工作流
3. 点击 "Run workflow" 开始部署
4. 等待部署完成

详细指南请参考：[ONE_CLICK_DEPLOY.md](ONE_CLICK_DEPLOY.md)

</details>

### 🌐 Web 界面部署

打开 `deploy.html` 文件，点击"一键部署"按钮，按照页面指引完成部署。

### 📦 本地部署

如果您更喜欢本地部署，请参考以下步骤：

### 环境要求

- Node.js 18+
- Wrangler CLI
- Cloudflare 账户

### 1. 克隆项目

```bash
git clone <repository-url>
cd medical-sales-website
```

### 2. 配置 Cloudflare 资源

```bash
# 使用自动化脚本（推荐）
chmod +x setup-resources.sh
./setup-resources.sh

# 脚本会自动创建 D1 数据库、R2 存储桶并配置环境
```

或手动配置：

```bash
# 创建 Cloudflare 资源
wrangler d1 create med-sales-db
wrangler r2 bucket create med-sales-images

# 更新 worker/wrangler.toml 中的 database_id

# 初始化数据库
cd worker
wrangler d1 execute med-sales-db --file=./schema.sql
wrangler d1 execute med-sales-db --file=./seed.sql

# 配置环境变量
wrangler secret put JWT_SECRET
wrangler secret put ADMIN_USERNAME
wrangler secret put ADMIN_PASSWORD
```

### 3. 部署后端

```bash
cd worker

# 安装依赖
npm install

# 部署 Worker
wrangler deploy
```

### 4. 部署前端

```bash
cd frontend

# 安装依赖
npm install

# 配置 API 地址
echo "VITE_API_URL=https://your-worker-domain.workers.dev" > .env.production

# 构建并部署
npm run build
wrangler pages deploy dist --project-name=medical-sales-frontend
```

## 📁 项目结构

```
medical-sales-website/
├── .github/workflows/     # GitHub Actions 工作流
│   └── deploy.yml        # 自动部署工作流
├── worker/                 # Cloudflare Workers 后端
│   ├── src/
│   │   ├── index.ts       # 应用入口
│   │   ├── routes/        # API 路由
│   │   │   ├── auth.ts    # 认证路由
│   │   │   ├── products.ts # 产品管理
│   │   │   ├── posts.ts   # 文章管理
│   │   │   ├── settings.ts # 站点设置
│   │   │   └── upload.ts  # 文件上传
│   │   ├── db.ts          # 数据库操作
│   │   └── utils.ts       # 工具函数
│   ├── schema.sql         # 数据库结构
│   ├── seed.sql          # 初始数据
│   └── wrangler.toml     # Worker 配置
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── Home.tsx   # 首页
│   │   │   ├── Products.tsx # 产品列表
│   │   │   ├── ProductDetail.tsx # 产品详情
│   │   │   ├── News.tsx   # 新闻列表
│   │   │   ├── AdminLogin.tsx # 管理员登录
│   │   │   └── admin/     # 管理后台页面
│   │   ├── components/    # 公共组件
│   │   │   ├── Header.tsx # 页头
│   │   │   ├── Footer.tsx # 页脚
│   │   │   ├── ProductCard.tsx # 产品卡片
│   │   │   └── AdminLayout.tsx # 管理后台布局
│   │   ├── api/          # API 封装
│   │   ├── hooks/        # 自定义 Hooks
│   │   └── styles/       # 样式文件
│   ├── package.json
│   └── vite.config.ts
├── deploy.html           # Web 部署界面
├── status.html          # 部署状态监控
├── deploy.sh            # 自动部署脚本
├── setup-resources.sh   # 资源配置脚本
├── DEPLOYMENT.md        # 详细部署指南
├── ONE_CLICK_DEPLOY.md  # 一键部署指南
├── TROUBLESHOOTING.md   # 故障排查指南
├── QUICK_START.md       # 快速开始
├── API_TESTING.md       # API 测试示例
├── PROJECT_HANDOVER.md  # 项目交付说明
└── README.md           # 项目说明
```

## 🎯 功能特性

### 前台功能
- 🏠 **首页展示**: 轮播图、产品推荐、新闻资讯
- 📦 **产品中心**: 产品分类、搜索筛选、详情展示
- 📰 **新闻资讯**: 行业动态、产品资讯
- 📞 **联系我们**: 公司信息、联系方式
- 🔍 **搜索功能**: 全文搜索、智能推荐

### 后台管理
- 👤 **用户认证**: JWT 登录、权限控制
- 📊 **数据统计**: 访问统计、产品分析
- 🛠️ **产品管理**: CRUD 操作、图片上传、分类管理
- 📝 **内容管理**: 文章发布、编辑审核
- ⚙️ **系统设置**: 站点配置、SEO 优化
- 📤 **文件管理**: R2 存储、批量上传

### 技术特性
- 🔒 **安全可靠**: JWT 认证、CORS 保护、输入验证
- ⚡ **高性能**: CDN 加速、缓存优化、懒加载
- 🌐 **SEO 友好**: 动态 meta、语义化 HTML、结构化数据
- 📱 **移动优先**: 响应式设计、触摸优化
- 🎨 **现代 UI**: Tailwind CSS、组件化设计

## 🛠️ 技术栈

### 后端
- **运行时**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (S3 兼容)
- **框架**: Hono.js
- **语言**: TypeScript

### 前端
- **框架**: React 18
- **路由**: React Router
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **HTTP 客户端**: Axios
- **语言**: TypeScript

## 📊 API 文档

### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify` - 验证 Token
- `POST /api/auth/refresh` - 刷新 Token

### 产品管理
- `GET /api/products` - 获取产品列表
- `GET /api/products/:id` - 获取产品详情
- `POST /api/products` - 创建产品（需认证）
- `PUT /api/products/:id` - 更新产品（需认证）
- `DELETE /api/products/:id` - 删除产品（需认证）

### 文章管理
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 创建文章（需认证）
- `PUT /api/posts/:id` - 更新文章（需认证）
- `DELETE /api/posts/:id` - 删除文章（需认证）

### 站点设置
- `GET /api/settings` - 获取站点设置
- `PUT /api/settings/:key` - 更新设置（需认证）

### 文件上传
- `POST /api/upload-url` - 获取上传 URL（需认证）
- `POST /api/upload` - 直接上传文件（需认证）

## 🔧 开发指南

### 本地开发

```bash
# 后端开发
cd worker
wrangler dev

# 前端开发
cd frontend
npm run dev
```

### 环境变量

**后端 (.env)**:
```
JWT_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
```

**前端 (.env)**:
```
VITE_API_URL=http://localhost:8787/api
```

### 数据库操作

```bash
# 创建表
wrangler d1 execute med-sales-db --file=./schema.sql

# 导入数据
wrangler d1 execute med-sales-db --file=./seed.sql

# 查询数据
wrangler d1 execute med-sales-db --command="SELECT * FROM products"
```

## 📈 性能优化

- **图片优化**: WebP 格式、懒加载、CDN 加速
- **代码分割**: 路由级别分割、动态导入
- **缓存策略**: 浏览器缓存、CDN 缓存、API 缓存
- **压缩优化**: Gzip 压缩、资源压缩

## 🔒 安全措施

- **认证授权**: JWT Token、角色权限
- **输入验证**: 前后端双重验证
- **CORS 保护**: 跨域请求控制
- **文件安全**: 类型检查、大小限制
- **SQL 注入**: 参数化查询

## 📱 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 💬 支持

如果您觉得这个项目有帮助，请给它一个 ⭐️

如有问题或建议，请：

1. 查看 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) 故障排查指南
2. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 部署指南
3. 提交 [Issue](../../issues) 报告问题
4. 发起 [Discussion](../../discussions) 参与讨论

## 📞 联系我们

- 📧 邮箱: info@medsales.com
- 📞 电话: 400-123-4567
- 🏢 地址: 北京市朝阳区医疗科技园区

---

**⚡ 由 Cloudflare 提供技术支持**
