import './network.js';
import { createAgent, createMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { z } from 'zod';

import { llmFactory } from './factory.js';
import libSearch from './tools/lib-search.js';

const { basic, pro } = llmFactory();

const SYSTEM_PROMPT = `
你是一个知识库问答与 UI 生成专家。你需要根据用户的提问，结合知识库中的信息，给出准确、简洁的回答；如果用户要求生成界面，则基于查询结果生成一个 json-render spec 来描述 UI。

要求：
1. 必须使用 lib-search 工具查询知识库中的信息，不能直接回答用户的问题。
2. 每次回答只能使用 lib-search 工具一次，查询结果必须直接对应用户问题或 UI 需求的关键信息，不能包含无关内容。
3. 回答必须简洁明了，避免冗长解释和无关信息。
4. 当用户要求生成 UI 时，只输出符合以下约束的 json-render spec。

可用组件：
- Card：卡片容器。属性：title（字符串，可选）、padding（"sm" | "md" | "lg"，可选）
- Stack：弹性布局容器。属性：direction（"vertical" | "horizontal"，可选）、gap（"sm" | "md" | "lg"，可选）、align（"start" | "center" | "end" | "stretch"，可选）
- Heading：标题文本。属性：text（字符串）、level（"h1" | "h2" | "h3" | "h4"，可选）
- Text：正文文本。属性：text（字符串）、variant（"body" | "caption" | "label"，可选）、color（"default" | "secondary" | "muted"，可选）
- TextInput：表单输入框。属性：label（字符串，可选）、placeholder（字符串，可选）、type（"text" | "email" | "password" | "number" | "textarea"，可选）
- Button：按钮。属性：label（字符串）、variant（"primary" | "secondary" | "ghost" | "link"，可选）、fullWidth（布尔值，可选）
- Separator：水平分隔线。属性：margin（"sm" | "md" | "lg"，可选）
- Badge：标签。属性：text（字符串）、variant（"default" | "success" | "warning" | "error" | "info"，可选）
- Rating：评分组件。属性：label（字符串，可选）、max（数字，可选，默认 5）、value（数字，可选）

规则：
- 返回结果必须包含 "root" 字段，用于指向根元素 ID。
- "elements" 映射中必须包含所有元素，并以唯一 ID 作为键。
- 每个元素都必须包含 "type"（组件名）、"props"（组件属性）和 "children"（子元素 ID 数组）。
- 使用具有描述性的 ID，例如 "card-1"、"email-input"、"submit-btn"。
- 叶子组件（TextInput、Button、Text、Badge、Rating、Separator）通常应使用空的 children 数组。
- 容器组件（Card、Stack）的 children 数组应引用其子元素 ID。
- 根元素必须始终使用 Card 包裹。
- 布局必须使用 Stack 组件。
`;

const checkpointer = new MemorySaver();

const middleware = createMiddleware({
  name: 'dynamic-llm-middleware',
  wrapModelCall(request, handler) {
    request.model = request.messages.length < 2 ? pro : basic;
    return handler(request);
  }
});

const ElementSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  children: z.array(z.string())
});

export const SpecSchema = z.object({
  root: z.string(),
  elements: z.record(z.string(), ElementSchema)
});

export type GenerateUISpec = z.infer<typeof SpecSchema>;

const agent = createAgent({
  model: pro,
  systemPrompt: SYSTEM_PROMPT,
  tools: [libSearch],
  checkpointer,
  middleware: [middleware]
});

type AgentStreamPayload = {
  input: Record<string, unknown> | null | undefined;
  context?: Record<string, unknown>;
  command?: unknown;
  config?: {
    configurable?: Record<string, unknown>;
    [key: string]: unknown;
  };
  streamSubgraphs?: boolean;
};

function resolveThreadId(payload: AgentStreamPayload) {
  const threadId = payload.config?.configurable?.thread_id;
  return typeof threadId === 'string' && threadId.length > 0
    ? threadId
    : 'great-gatsby-lc';
}

function streamAgent(payload: AgentStreamPayload) {
  const input = payload.input ?? { messages: [] };

  return agent.stream(input as Parameters<typeof agent.stream>[0], {
    ...payload.config,
    configurable: {
      ...payload.config?.configurable,
      thread_id: resolveThreadId(payload)
    },
    streamMode: ['messages', 'updates', 'custom']
  });
}

export { streamAgent };
export type { AgentStreamPayload };
