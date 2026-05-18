# frontend-generative-ui

这是当前生成式 UI 前端包。

## 安装依赖

在仓库根目录执行一次安装即可：

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

在当前包目录启动：

```bash
pnpm dev
```

或在仓库根目录启动当前包：

```bash
pnpm dev:frontend-generative-ui
```

配套后端服务可从仓库根目录启动：

```bash
pnpm dev:backend-agent-to-ui
```

前端默认会读取 `NEXT_PUBLIC_AGENT_API_URL`，示例值为 `http://localhost:3001`。

## 构建命令

```bash
pnpm build
pnpm lint
```
