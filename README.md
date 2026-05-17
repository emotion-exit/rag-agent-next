# rag-agent-next

当前仓库已经按 pnpm workspace 组织为一个轻量 monorepo：

- 根目录：Next.js 前端
- services/langchain-agent：独立 LangChain/Fastify 服务

## 安装依赖

```bash
pnpm install
```

## 本地开发

启动前端：

```bash
pnpm dev
```

启动独立 Agent 服务：

```bash
pnpm dev:agent
```

前端默认会读取 `NEXT_PUBLIC_LANGCHAIN_SERVICE_URL`，未配置时回退到 `http://localhost:2024`。

Agent 服务默认监听 `2024` 端口，可通过以下环境变量覆盖：

- `PORT` 或 `AGENT_SERVICE_PORT`
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
