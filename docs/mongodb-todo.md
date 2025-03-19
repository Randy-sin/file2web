# MongoDB 集成任务清单

本文档列出了将 File2Web 项目从内存存储迁移到 MongoDB 数据库的所有任务。

## 基础设置

- [x] 安装 MongoDB 驱动程序 (`npm install mongodb`)
- [x] 配置 MongoDB 连接字符串 (在 `.env.local` 文件中)
- [x] 创建 MongoDB 连接工具 (`src/lib/mongodb.ts`)
- [x] 测试 MongoDB 连接 (使用测试脚本)

## 数据模型设计

- [x] 设计单文件内容的数据模型
- [x] 设计多文件网站的数据模型
- [x] 实现数据模型的 TypeScript 接口

## API 路由更新

- [x] 更新单文件存储 API 路由 (`/api/storage/route.ts`)
- [x] 更新多文件网站存储 API 路由 (`/api/storage/website/route.ts`)
- [x] 更新特定文件内容 API 路由 (`/api/storage/website/[id]/[filename]/route.ts`)

## 前端集成

- [x] 更新 `HtmlPreview` 组件，使用 MongoDB 存储的内容
- [x] 更新单文件预览页面 (`/preview/[id]/page.tsx`)
- [x] 更新多文件网站预览页面 (`/preview/website/[id]/page.tsx`)
- [ ] 测试多文件网站的导航和链接

## 测试与优化

- [ ] 编写全面的测试用例
- [ ] 测试所有 API 路由
- [ ] 测试前端功能
- [ ] 优化数据库查询性能

## 部署与监控

- [ ] 更新部署配置
- [ ] 设置数据库监控
- [ ] 实现数据备份策略
- [ ] 文档化 MongoDB 集成过程 