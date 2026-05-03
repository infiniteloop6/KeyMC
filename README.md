# KeyMC

基于 Cloudflare R2 的安全云端密码管理器，使用 KDBX 格式（兼容 KeePass），零信任架构。

## 功能特性

- **KDBX 密码库** — 兼容 KeePass 格式，AES-256 加密 + Argon2 密钥派生
- **新建密码库** — 在浏览器中创建新密码库并下载到本地，手动上传到 R2
- **Cloudflare R2 存储** — 通过 Worker API 读写 R2 中的 .kdbx 文件
- **ETag 并发控制** — 多设备编辑时自动检测冲突，提供解决方案
- **零信任架构** — 主密码永远不会离开浏览器，加解密完全在本地完成
- **密码生成器** — 可自定义长度、字符类型，实时评估密码强度
- **文件夹管理** — 支持多级文件夹结构，条目分类管理
- **移动端适配** — 响应式设计，适配桌面和移动设备

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | SvelteKit (Svelte 5 + Runes) |
| 样式 | Tailwind CSS 4 |
| 语言 | TypeScript |
| 密码库 | kdbxweb |
| 密钥派生 | argon2-browser (WASM) |
| 云存储 | Cloudflare R2 |
| 运行时 | Cloudflare Workers (Edge) |
| 部署 | Cloudflare Pages |
| 构建 | Vite 8 |

## 项目结构

```
src/
├── lib/
│   ├── components/
│   │   ├── common/          # 通用组件 (Button, Modal, SearchBar, Toast)
│   │   ├── database/        # 数据库视图 (DatabaseView, R2FilePicker, UnlockScreen)
│   │   ├── entry/           # 条目组件 (EntryCard, EntryDetail, EntryEditor, PasswordGenerator)
│   │   └── layout/          # 布局组件 (AppShell, Header, Sidebar)
│   ├── kdbx/
│   │   ├── argon2-setup.ts  # Argon2 WASM 初始化
│   │   ├── kdbx-service.ts  # KDBX 数据库操作服务
│   │   ├── kdbx-types.ts    # 类型定义
│   │   └── password-generator.ts  # 密码生成与强度评估
│   ├── r2/
│   │   ├── r2-client.ts     # R2 API 客户端（含 ETag 并发控制）
│   │   └── types.ts         # R2 类型定义
│   ├── server/
│   │   └── api-utils.ts     # 服务端 API 工具（鉴权、响应）
│   └── stores/
│       ├── auth.svelte.ts   # 认证状态管理
│       ├── database.svelte.ts  # 数据库状态管理
│       └── ui.svelte.ts     # UI 状态管理
├── routes/
│   ├── api/
│   │   ├── auth/verify/     # 令牌验证
│   │   └── files/           # 文件操作 (list, get, put, delete)
│   ├── +layout.svelte       # 根布局
│   └── +page.svelte         # 主页面
├── app.css                  # 全局样式
└── app.html                 # HTML 模板
```

## 部署教程

### 前置条件

- 一个 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)（免费即可）
- 一个 [GitHub 账户](https://github.com/signup)

### 第一步：Fork 仓库

1. 登录 GitHub
2. 访问 [KeyMC 仓库](https://github.com/infiniteloop6/KeyMC)
3. 点击右上角 **Fork** 按钮，将仓库 Fork 到你的账户下 **修改项目名称**

### 第二步：创建 Cloudflare R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **存储和数据库** → **R2 对象存储** → **概述** → **创建存储桶**
3. 存储桶名称填写 `keymc-vault`（必须与 `wrangler.toml` 中的 `bucket_name` 一致）
4. 位置可以选择最近的，国内则亚太，默认存储类标准即可。
4. 点击 **创建存储桶**

> 如果你想使用其他名称，需要同时修改 `wrangler.toml` 中的 `bucket_name`。
 
### 第三步：创建访问令牌

访问令牌用于保护你的 KeyMC 实例，防止他人访问你的密码库。

1. 在 Cloudflare Dashboard，进入 **管理账户** → **账户API令牌**
2. 点击 **创建 API 令牌**
3. 配置：
   - **令牌名称**：`keymc-access`（或任意名称）
   - **权限策略**：选择Developer Platform中的Workers R2 Storage 读写都勾选后审核令牌
4. 点击 **创建 API 令牌**
5. **复制生成的令牌值**（只显示一次，请妥善保存）

> 这个令牌不是 KeyMC 的 ACCESS_TOKEN，而是 R2 的 API 令牌。
> KeyMC 使用的是自己定义的 ACCESS_TOKEN 环境变量。

### 第四步：部署到 Cloudflare Pages

1. 在 Cloudflare Dashboard，进入 **Workers 和 Pages** → **创建** → **点击下方的Pages 开始使用** → **导入现有Git存储库**
2. 选择你 Fork 的 KeyMC 仓库
3. 配置构建设置：
   - **框架预设**：`SvelteKit`
   - **构建命令**：`npm run build`
   - **构建输出目录**：`.svelte-kit/cloudflare`
4. 点击 **保存并部署**

> 首次部署可能会失败，因为还没有配置环境变量和 R2 绑定，这是正常的。继续下一步。

### 第五步：配置环境变量

1. 在 Cloudflare Pages 项目页面，进入 **设置** → **选择环境：生产**
2. 添加一个 **机密（加密变量）**：
   - 类型选择 **密钥**
   - 变量名：`ACCESS_TOKEN`
   - 值：你自己设定的一个密码
   - **注意要在生成环境中进行设置**

> ACCESS_TOKEN 是你登录 KeyMC 时需要输入的访问令牌，请牢记。


### 第六步：绑定 R2 存储桶（如未更改存储桶名称则无需设置）

1. 在 Cloudflare Pages 项目页面，进入 **设置** → **函数** → **R2 存储桶绑定**
2. 点击 **添加绑定**
3. 配置：
   - **变量名**：`R2_BUCKET`（必须与 `wrangler.toml` 中的 `binding` 一致）
   - **R2 存储桶**：选择 `keymc-vault`
4. 点击 **保存**

### 第七步：重新部署

1. 在 Cloudflare Pages 项目页面，进入 **部署** 标签
2. 找到失败的部署，点击 **重试部署**
3. 或者向 GitHub 仓库推送一次提交触发自动部署

部署成功后，你将获得一个 `https://你的项目名.pages.dev` 的访问地址。

### 第八步：开始使用

部署成功后，你可以通过以下方式开始使用 KeyMC：

**方式一：在 KeyMC 中新建密码库（推荐）**

1. 打开你的 KeyMC 网址
2. 输入 ACCESS_TOKEN 连接
3. 点击右上角 **新建密码库** 按钮
4. 输入密码库名称和主密码
5. 点击 **创建并下载**，密码库文件将下载到本地
6. 在 Cloudflare Dashboard，进入 **R2 对象存储** → `keymc-vault`
7. 点击 **上传文件**，选择刚才下载的 `.kdbx` 文件
8. 上传完成后，回到 KeyMC 打开该文件

## 使用教程

### 登录

1. 打开你的 KeyMC 网址（如 `https://keymc.pages.dev`）
2. 在访问令牌输入框中输入你在第五步设置的 ACCESS_TOKEN
3. 点击 **连接**

### 新建密码库

1. 连接成功后，点击右上角 **新建密码库** 按钮
2. 输入密码库名称（将作为下载的文件名）
3. 设置主密码并确认
4. 点击 **创建并下载**，`.kdbx` 文件将自动下载到本地
5. 在 Cloudflare Dashboard 中将下载的文件上传到 R2 存储桶
6. 回到 KeyMC，从云端文件列表中打开该密码库

### 打开密码库

1. 连接成功后，点击 **打开云端文件** 按钮
2. 在文件列表中选择你的 `.kdbx` 文件
3. 输入主密码
4. 点击 **解锁**

### 管理条目

- **新增条目**：点击条目列表上方的 **+** 按钮，填写标题、用户名、密码等信息
- **编辑条目**：点击条目查看详情，点击编辑按钮修改
- **复制密码**：点击条目卡片右侧的复制图标，或详情页的复制按钮
- **删除条目**：在条目详情页点击删除按钮
- **搜索条目**：在搜索框中输入关键词，支持按标题、用户名、URL、备注搜索

### 管理文件夹

- **新建文件夹**：点击左侧边栏底部的 **新建文件夹** 按钮
- **切换文件夹**：点击侧边栏中的文件夹名称筛选条目
- **删除文件夹**：点击文件夹右侧的更多按钮，选择删除

### 密码生成器

在编辑条目时，点击密码字段旁的生成器按钮：
- 拖动滑块调整密码长度（4-64 位）
- 勾选/取消字符类型：大写字母、小写字母、数字、符号
- 实时查看密码强度评估

### 保存到云端

修改条目后，点击顶部的 **保存** 按钮将更改同步到 R2。标题栏的文件名旁出现圆点表示有未保存的更改。

### 处理冲突

如果多设备同时编辑，保存时可能遇到冲突。KeyMC 会检测远程文件是否已被修改，并提供三种处理方式：

1. **覆盖远程版本** — 用本地版本覆盖远程文件，远程的修改将丢失
2. **拉取远程并重新保存** — 先拉取远程最新版本，然后用本地版本覆盖保存
3. **取消** — 暂不保存，稍后处理

### 锁定密码库

点击顶部的 **锁定** 按钮关闭当前数据库。锁定后需要重新输入访问令牌和主密码才能访问。

## 安全说明

- **主密码不离开浏览器** — 加密和解密完全在浏览器本地完成，主密码不会发送到任何服务器
- **KDBX 加密** — 使用 AES-256 加密算法和 Argon2 密钥派生函数，与 KeePass 相同的安全标准
- **访问令牌保护** — 所有 API 请求都需要携带 ACCESS_TOKEN，存储在 Cloudflare 加密环境变量中
- **CSP 安全头** — 配置了 Content-Security-Policy 等 HTTP 安全头
- **令牌本地存储** — 访问令牌存储在浏览器 localStorage 中，关闭浏览器后保留（可手动退出清除）

## 本地开发

```bash
# 克隆仓库
git clone https://github.com/infiniteloop6/KeyMC.git
cd KeyMC

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run check

# 构建生产版本
npm run build
```

> 本地开发时，API 路由需要 Cloudflare Workers 运行时环境。可以使用 `npx wrangler pages dev` 进行本地开发。

## License

MIT