# 💕 恋爱每一天

一个专属于恋爱期间的网站，记录你们在一起的每一天。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3FCF8E)

## ✨ 功能特色

| 功能 | 说明 |
|------|------|
| 🏠 **首页** | 在一起天数实时计时器、情侣头像、快捷入口、最新动态 |
| 📅 **时间轴** | 记录重要时刻（第一次见面、表白、约会等），支持图片 |
| 📸 **相册** | 照片分类管理、大图预览、多图上传 |
| 📝 **日记** | 写恋爱日记、心情记录、配图 |
| 🎂 **纪念日** | 倒计时/正计时、纪念日管理 |
| 💌 **情书** | 写情书、收发信件、信件样式展示 |
| ⚙️ **设置** | 情侣信息、头像上传、数据导入导出 |

## 🎨 设计风格

- 💗 粉色 + 浅紫渐变主色调，温馨浪漫
- 💓 心跳动画、飘落的爱心/花瓣
- 🪟 玻璃态卡片效果
- 📱 响应式设计，支持手机和电脑

## 🚀 部署到 Vercel

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yanghao20031024-png/love-every-day)

### 手动部署

1. Fork 本仓库到你的 GitHub
2. 访问 [Vercel](https://vercel.com) 并用 GitHub 登录
3. 点击 **"New Project"** → 选择 `love-every-day` 仓库
4. 在 **Environment Variables** 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon public key
5. 点击 **"Deploy"**

## 🗄️ Supabase 配置

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com) 并注册
2. 创建新项目，记住数据库密码

### 2. 创建数据表
在 Supabase SQL Editor 中执行：

```sql
CREATE TABLE love_data (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE love_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON love_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. 创建存储桶
1. 进入 **Storage** 页面
2. 点击 **"Create a new bucket"**
3. 名称输入 `uploads`
4. 勾选 **Public bucket**
5. 点击 **"Create bucket"**

## 📦 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **文件存储**: Supabase Storage

## 📝 使用说明

1. 首次使用请到「设置」页面配置情侣信息和起始日期
2. 在「时间轴」记录你们的重要时刻
3. 在「相册」上传你们的照片
4. 在「日记」写下你们的故事
5. 在「情书」给对方写一封信
6. 数据支持导出/导入，方便备份

## 💖 致谢

感谢所有相爱的人，愿你们的每一天都充满爱意。

---

Made with 💕 by [yanghao20031024](https://github.com/yanghao20031024-png)
