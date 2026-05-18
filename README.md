# rag-agent-next

当前仓库已调整为 pnpm workspace monorepo，包含三个独立包：

- `packages/frontend-generative-ui`：当前生成式 UI 前端
- `packages/backend-agent-to-ui`：当前 LangGraph Agent 服务
- `packages/fullstack-next-agent`：从 `main` 分支导入的全栈 Next Agent 版本

## 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

也可以使用根目录脚本：

macOS / Linux:

```bash
./install.sh
```

Windows PowerShell:

```powershell
.\install.ps1
```

## 根目录命令

启动各 workspace：

```bash
pnpm dev:frontend-generative-ui
pnpm dev:backend-agent-to-ui
pnpm dev:fullstack-next-agent
```

其他常用命令：

```bash
pnpm build:frontend-generative-ui
pnpm build:backend-agent-to-ui
pnpm build:fullstack-next-agent
pnpm lint:frontend-generative-ui
pnpm lint:fullstack-next-agent
```

## 包结构

- `packages/frontend-generative-ui` 默认读取 `NEXT_PUBLIC_AGENT_API_URL`
- `packages/backend-agent-to-ui` 开发模式默认监听 `3001`
- `packages/fullstack-next-agent` 保留 `main` 分支原有的同源全栈结构# rag-agent-next

当前仓库已经按 pnpm workspace 组织为一个轻量 monorepo：

- 根目录：Next.js 前端
- services：独立 LangChain/Fastify 服务

## 安装依赖

仓库使用 pnpm workspace 管理依赖。在根目录执行一次安装，就会同时安装：

- Next.js 前端依赖
- services 下 Agent 服务依赖

直接使用 pnpm：

```bash
pnpm install
```

也可以使用仓库内置脚本：

macOS / Linux:

```bash
./install.sh
```

Windows PowerShell:

```powershell
.\install.ps1
```

## 本地开发

同一个终端同时启动前端和独立 Agent 服务：

```bash
pnpm dev
```

只启动前端：

```bash
pnpm dev:web
```

只启动独立 Agent 服务：

```bash
pnpm dev:agent
```

前端默认会读取 `NEXT_PUBLIC_AGENT_API_URL`，示例值为 `http://localhost:3001`。

Agent 服务开发模式默认监听 `3001` 端口。

- `WEB_ORIGIN`：允许访问 Agent 服务的前端来源
- `LIBRARY_FILE_PATH`：可选，自定义知识库文件路径；未配置时默认读取根目录下的 `db/lib.txt`

## 构建命令

```bash
pnpm build
pnpm build:agent
pnpm lint
```

## 当前架构

- 前端主页使用 `ConversationStage`
- 前端直接连接独立 Agent 服务
- 旧的 Next Route Handler `/api/chat` 与根目录 `backend/` 已移除
