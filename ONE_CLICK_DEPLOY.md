# 🚀 一键部署到 Cloudflare

> **✅ 问题已修复**: 
> - 解决了"找不到 wrangler 配置文件"的问题
> - 修复了 D1 数据库 binding ID 验证错误 (code: 10021)
> - 现在支持从根目录进行一键部署

我们提供了两种便捷的部署方式，让您可以快速将医疗器械销售官网部署到 Cloudflare。

## ⚠️ 重要提示

在首次部署前，您需要先创建 Cloudflare 资源（D1 数据库和 R2 存储桶）。我们提供了自动化脚本来简化这个过程。

## 📋 方式一：GitHub Actions 一键部署（推荐）

### 🎯 前置条件

1. **Fork 项目到您的 GitHub**
   - 访问项目页面
   - 点击右上角的 "Fork" 按钮
   - 选择要 Fork 到的账户

2. **获取 Cloudflare API Token**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "My Profile" → "API Tokens"
   - 点击 "Create Token" → "Custom token"
   - 配置权限：
     ```
     Account: Cloudflare D1:Edit
     Account: Cloudflare R2:Edit  
     Zone: Zone:Read
     Account: Account Settings:Read
     ```
   - 复制生成的 Token

3. **获取 Cloudflare Account ID**
   - 在 Cloudflare Dashboard 右侧边栏可以找到 Account ID

### ⚙️ 配置 GitHub Secrets

在您 Fork 的 GitHub 仓库中：

1. 进入 "Settings" → "Secrets and variables" → "Actions"
2. 点击 "New repository secret"，添加以下密钥：

| Secret 名称 | 值 |
|-------------|-----|
| `CLOUDFLARE_API_TOKEN` | 您的 Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 您的 Cloudflare Account ID |
| `API_URL` | `https://your-worker-domain.workers.dev/api`（部署后更新）|

### 🚀 一键部署

1. 进入您 Fork 仓库的 "Actions" 标签页
2. 选择 "Deploy to Cloudflare" 工作流
3. 点击 "Run workflow"
4. 选择部署环境（production/staging）
5. 点击 "Run workflow" 开始部署

部署完成后，您将看到：
- ✅ **前端网站**: `https://medical-sales-frontend.pages.dev`
- ⚙️ **后端 API**: `https://medical-sales-worker.your-subdomain.workers.dev`
- 🔐 **管理后台**: `https://medical-sales-frontend.pages.dev/admin/login`

## 📋 方式二：本地一键部署脚本

### 🎯 前置条件

1. **安装必要工具**
   ```bash
   # 安装 Node.js (推荐 v18+)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # 安装 Wrangler CLI
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

### ⚙️ 配置项目

1. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/medical-sales-website.git
   cd medical-sales-website
   ```

2. **自动配置 Cloudflare 资源（推荐）**
   ```bash
   # 运行自动化配置脚本
   chmod +x setup-resources.sh
   ./setup-resources.sh
   ```
   
   这个脚本会自动：
   - ✅ 创建 D1 数据库 `med-sales-db`
   - ✅ 创建 R2 存储桶 `med-sales-images`
   - ✅ 自动更新 wrangler.toml 配置文件
   - ✅ 初始化数据库结构
   - ✅ 导入种子数据（可选）
   - ✅ 配置环境变量（可选）

3. **手动配置 Cloudflare 资源（可选）**
   如果您想手动配置，请执行：
   ```bash
   # 创建数据库并获取 ID
   wrangler d1 create med-sales-db
   # 输出示例：
   # ✅ Successfully created DB 'med-sales-db'
   # database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   
   # 创建存储桶
   wrangler r2 bucket create med-sales-images
   
   # 手动更新 worker/wrangler.toml 配置文件
   # 将 database_id 替换为上面创建的实际 ID
   # database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```

4. **设置环境变量**
   ```bash
   wrangler secret put JWT_SECRET
   # 输入: your-super-secret-jwt-key-here
   
   wrangler secret put ADMIN_USERNAME
   # 输入: admin
   
   wrangler secret put ADMIN_PASSWORD
   # 输入: your-secure-password-here
   ```

### 🚀 一键部署

运行自动部署脚本：

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行一键部署
./deploy.sh
```

脚本将自动完成：
- ✅ 安装依赖
- ✅ 部署 Worker
- ✅ 构建前端
- ✅ 部署到 Pages
- ✅ 输出访问链接

## 📋 方式三：Web 界面部署

1. **打开部署页面**
   - 在浏览器中打开 `deploy.html`
   - 或者访问在线部署页面（如果已部署）

2. **点击"一键部署"按钮**
   - 系统会显示部署进度
   - 部署完成后显示访问链接

3. **按照页面指引配置**
   - Fork 项目
   - 配置 API Token
   - 设置 GitHub Secrets

## 🔧 部署后配置

### 1. 更新前端 API 地址

如果前端和后端域名不同，需要更新前端配置：

```bash
cd frontend
echo "VITE_API_URL=https://your-worker-domain.workers.dev/api" > .env.production
npm run build
wrangler pages deploy dist --project-name=medical-sales-frontend
```

### 2. 配置自定义域名（可选）

#### Worker 自定义域名
```bash
wrangler custom-domains add api.yourdomain.com
```

#### Pages 自定义域名
在 Cloudflare Pages 项目设置中添加自定义域名。

### 3. 设置数据库（首次部署）

```bash
# 从根目录执行
wrangler d1 execute med-sales-db --file=./worker/schema.sql
wrangler d1 execute med-sales-db --file=./worker/seed.sql
```

## 🔑 访问信息

### 默认管理员账号
- **用户名**: `admin`
- **密码**: `admin123`

> ⚠️ **重要**: 首次登录后请立即修改密码！

### 访问地址
- **前台网站**: `https://medical-sales-frontend.pages.dev`
- **管理后台**: `https://medical-sales-frontend.pages.dev/admin/login`
- **API 文档**: 参考 `API_TESTING.md`

## 🛠️ 故障排查

### 常见问题

1. **D1 数据库 binding ID 错误 (code: 10021)**
   ```
   错误: binding DB of type d1 must have a valid `id` specified [code: 10021]
   ```
   
   **解决方案**：
   ```bash
   # 运行资源配置脚本
   ./setup-resources.sh
   
   # 或手动创建数据库并更新配置
   wrangler d1 create med-sales-db
   # 将返回的 database_id 填入 worker/wrangler.toml
   ```

2. **GitHub Actions 失败**
   - 检查 Secrets 配置是否正确
   - 确认 API Token 权限足够
   - 查看 Actions 日志了解具体错误

3. **Worker 部署失败**
   ```bash
   # 检查配置
   wrangler whoami
   wrangler deploy --dry-run
   
   # 验证 wrangler.toml 中是否已填写 database_id
   grep database_id worker/wrangler.toml
   ```

4. **数据库连接错误**
   ```bash
   # 验证数据库绑定
   wrangler d1 list
   wrangler d1 execute med-sales-db --command="SELECT 1"
   
   # 检查数据库是否已初始化
   wrangler d1 execute med-sales-db --command="SELECT name FROM sqlite_master WHERE type='table'"
   ```

5. **前端构建失败**
   ```bash
   # 清理依赖
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### 获取帮助

- 📖 查看详细文档：`DEPLOYMENT.md`
- 🧪 API 测试指南：`API_TESTING.md`
- 📋 项目交付：`PROJECT_HANDOVER.md`
- 🚀 快速开始：`QUICK_START.md`

## 🎉 部署完成

恭喜！您的医疗器械销售官网已成功部署到 Cloudflare！

现在您可以：
- 🌐 访问您的网站
- 🔐 登录管理后台
- 📦 管理产品和文章
- ⚙️ 配置站点设置
- 📊 监控网站性能

享受您的全新医疗器械销售网站吧！🎊