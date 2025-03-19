# File2Web - 文字转网页工具

File2Web 是一个简单易用的工具，帮助用户将文字内容转换为精美的网页。无需编程知识，只需上传文字，AI 将为您生成专业的网页。

## 功能特点

- **简单上传**：轻松上传您的文字内容，支持直接粘贴或文件上传。
- **AI 生成**：利用先进的 Monica AI 技术，将您的文字内容转换为精美的网页。
- **精美设计**：生成的网页采用现代化设计，响应式布局，适配各种设备。
- **一键下载**：生成网页后，可以一键下载所有文件，方便部署到您的网站。
- **实时预览**：在同一页面中预览生成的网页
- **复制代码**：一键复制 HTML 代码
- **新窗口打开**：在新标签页中打开预览
- **深色/浅色模式**：支持深色和浅色模式切换

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **语言**：TypeScript
- **AI 集成**：Monica AI API (Claude-3.5-Sonnet)

## 环境变量配置

项目使用以下环境变量，需要在`.env.local`文件中进行配置：

```
# MONICA API密钥 - 用于AI生成功能
MONICA_API_KEY=your_monica_api_key_here

# MongoDB连接配置
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?appName=AppName

# 环境设置
NODE_ENV=development # 开发环境
# NODE_ENV=production # 生产环境
# NODE_ENV=test # 测试环境
```

## MongoDB连接说明

- **开发环境**：使用标准TLS设置
- **生产环境**：使用宽松的TLS设置，解决某些部署环境的连接问题
- **测试环境**：介于两者之间的设置

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行生产版本

```bash
npm start
```

## 部署到 Vercel

1. 在 Vercel 控制台中创建新项目
2. 连接到您的 GitHub 仓库
3. 在项目设置中，添加环境变量：
   - 名称：`MONICA_API_KEY`
   - 值：您的 Monica AI API Key
4. 部署项目

## 项目结构

```
file2web-app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面
│   │   ├── convert/
│   │   │   └── page.tsx      # 转换页面
│   │   ├── api/
│   │   │   └── generate/
│   │   │       └── route.ts  # AI 生成 API 路由
│   │   ├── layout.tsx        # 布局组件
│   │   └── globals.css       # 全局样式
│   ├── components/
│   │   ├── Header.tsx        # 页面头部组件
│   │   ├── Footer.tsx        # 页面底部组件
│   │   ├── Hero.tsx          # 英雄区域组件
│   │   ├── Features.tsx      # 特性展示组件
│   │   ├── HowItWorks.tsx    # 使用方法组件
│   │   ├── TextEditor.tsx    # 文本编辑器组件
│   │   └── HtmlPreview.tsx   # HTML 预览组件
├── public/                   # 静态资源
├── package.json              # 项目依赖
└── README.md                 # 项目说明
```

## 使用方法

1. **访问转换页面**：点击首页上的"开始转换"按钮，进入转换页面。
2. **输入文字内容**：在文本编辑器中输入您的文字内容，或者上传文本文件。
3. **点击生成按钮**：点击"生成网页"按钮，AI 将自动分析您的内容并生成网页。
4. **预览生成结果**：预览生成的网页效果，确认内容和样式是否符合您的需求。
5. **下载网页文件**：满意后，点击下载按钮获取所有网页文件，随时可以部署使用。

## AI 集成说明

本项目使用 Monica AI API 来生成 HTML 网页。API 集成流程如下：

1. 用户在文本编辑器中输入内容
2. 点击"生成网页"按钮后，内容被发送到后端 API
3. 后端 API 调用 Monica AI 的 Claude-3.5-Sonnet 模型
4. AI 生成完整的 HTML 代码并返回
5. 前端展示生成的网页预览，并提供下载功能

> 注意：API 密钥存储在后端，确保安全性。在生产环境中，应使用环境变量来存储 API 密钥。

## 预览功能

预览功能通过 `HtmlPreview` 组件实现，提供以下功能：

- **实时预览**：使用 iframe 展示生成的网页
- **代码查看**：显示生成的 HTML 代码
- **下载功能**：将生成的 HTML 下载为文件
- **复制代码**：一键复制 HTML 代码
- **新窗口打开**：在新标签页中打开预览
- **刷新预览**：重新加载预览内容

预览区域集成在转换页面中，当生成网页后会自动滚动到预览区域。预览区域包含预览标题、预览窗口和 HTML 代码显示区域，使用户可以方便地查看和使用生成的网页。

## 未来计划

- 添加更多网页模板
- 支持更多文件格式
- 增加自定义样式选项
- 提供网页托管服务
- 优化 AI 提示词，提高生成质量

## 贡献指南

欢迎贡献代码或提出建议！请遵循以下步骤：

1. Fork 项目
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 联系我们

如有任何问题或建议，请通过以下方式联系我们：

- 电子邮件：contact@file2web.com
- GitHub Issues：[https://github.com/yourusername/file2web/issues](https://github.com/yourusername/file2web/issues)

## 最近修复的问题

### 2025年3月
- 修复了构建过程中的TypeScript类型错误
- 修复了MongoDB连接选项冲突问题
- 更新了API路由以兼容Next.js 15的类型要求
- 修复了`listCollections()`参数缺失问题
- 优化了MongoDB连接选项，确保生产环境连接可靠

## 开发指南

### 环境设置
1. 确保安装了Node.js 18+ 和npm
2. 复制`.env.example`到`.env.local`并填写必要的环境变量
3. 安装依赖：`npm install`

### 开发命令
- 启动开发服务器：`npm run dev`
- 构建应用程序：`npm run build`
- 启动生产服务器：`npm run start`
- 运行测试：`npm run test`

### 测试API
应用程序包含多个测试API，可以用来验证功能是否正常：
- MongoDB连接测试：`/api/test-mongodb`
- 数据库功能测试：`/api/test-db`
- 网页发布功能测试：`/api/test-publish`

### 技术栈
- 前端框架：Next.js 15，React
- 样式：Tailwind CSS
- 后端：Next.js API路由
- 数据库：MongoDB
- 部署：Vercel/任何支持Node.js的服务器

## 使用指南

1. 访问应用程序首页
2. 输入HTML内容或上传HTML文件
3. 点击"生成网页"按钮
4. 成功后，您将获得一个可分享的公共URL

## 系统架构

该应用程序采用Next.js的App Router架构，结合以下特性：
- 服务器组件和客户端组件分离
- MongoDB数据库用于存储网页内容
- 使用nanoid生成唯一、短小的URL
- 文件支持多文件网站上传
