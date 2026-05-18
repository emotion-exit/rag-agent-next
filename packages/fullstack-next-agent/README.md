# fullstack-next-agent

这是从 `main` 分支导入的全栈 Next Agent 包。

## 开发

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

默认访问地址：

- http://localhost:3001

## 后端联调

- 前端当前通过 Next Route Handler 访问同源 /api/chat
- 后端推理逻辑位于 frontend-nextjs/backend 目录，由 Next 服务直接调用
- 从仓库根目录启动时，使用 `pnpm dev:fullstack-next-agent`

## 相关命令

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```
