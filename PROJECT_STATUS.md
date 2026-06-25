# FreeMusic - 项目状态

## 已完成 ✅

### 核心架构
- [x] Vite + Vue 3 + TypeScript + Tailwind CSS 项目搭建
- [x] Pinia 状态管理（player / playlist / theme 三个 store）
- [x] 完整的目录结构
- [x] PWA 配置（可安装到桌面）
- [x] Vercel 部署配置（`vercel.json`）

### 前端组件（9个）
- [x] **App.vue** — 主布局，顶部搜索栏 + 内容区 + 底部播放条
- [x] **SearchBar.vue** — 搜索框，支持 B站 / 网易云 / QQ音乐 多源切换
- [x] **TrackList.vue** — 搜索结果列表 + 歌单列表，可切换 Tab
- [x] **PlayerControls.vue** — 底部播放控制条，含可视化条、进度条、音量、歌词动效切换
- [x] **FullModePlayer.vue** — 全屏播放模式（左封面 + 右歌词 + 控制）
- [x] **LyricScroller.vue** — 歌词滚动组件，6种动效（滚动/卡拉OK/波浪/打字机/发光/跳动）
- [x] **AudioVisualizer.vue** — 音频可视化，4种场景（波浪/粒子/极光/通用）
- [x] **DanmakuOverlay.vue** — 弹幕层，可发送/切换/自动模拟弹幕
- [x] **PlaylistManager.vue** — 歌单管理弹窗（创建/重命名/删除/播放）
- [x] **SceneSelector.vue** — 6种场景切换（音浪/粒子/极光/唱片/星云/萤火）
- [x] **MoodSelector.vue** — 7种心情选择（开心/难过/平静/活力/浪漫/忧郁/随机）

### 后端 API（3个）
- [x] **api/search.ts** — 搜索路由，聚合 B站 / 网易云 / QQ音乐
- [x] **api/stream.ts** — 获取音频流地址
- [x] **api/lyrics.ts** — 获取 LRC 格式歌词（从网易云）
- [x] **api/utils.ts** — 各平台 API 封装

### 功能清单
- [x] B站视频搜索 + 音频提取播放
- [x] 网易云音乐搜索 + 播放
- [x] QQ音乐搜索 + 播放
- [x] 同步滚动歌词（6种动效模式）
- [x] 音频频谱可视化（4种风格）
- [x] 弹幕系统（发送/显示/自动模拟）
- [x] 歌单管理（创建/重命名/删除/播放）
- [x] 6种场景主题切换
- [x] 心情推荐（根据时间和心情推荐场景）
- [x] 播放模式（顺序/随机/单曲循环）
- [x] 响应式布局（桌面 + 移动端）
- [x] 本地存储（歌单持久化）

### 验证
- [x] `npm run build` 构建成功（55 modules，8.38s）
- [x] PWA 生成正常（sw.js + workbox）

## 待做 ❌

### 第5步：盈利入口（轻量）
- [ ] "打赏/请喝咖啡"按钮
- [ ] 分享卡片生成
- [ ] 自定义场景付费解锁入口

### 部署相关
- [ ] 上传 GitHub 仓库
- [ ] 在 Vercel 部署
- [ ] 配置自定义域名（可选）

## 关键文件路径

```
C:/Users/李梓铖/Desktop/听歌软件/
├── api/           # 后端 API（Vercel Serverless）
├── src/
│   ├── components/  # 所有 Vue 组件
│   ├── stores/      # 状态管理
│   ├── utils/       # 工具函数
│   └── types/       # 类型定义
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── vercel.json
```

## 本地运行
```bash
cd /c/Users/李梓铖/Desktop/听歌软件
npm run dev
```

## 构建
```bash
npm run build
```
