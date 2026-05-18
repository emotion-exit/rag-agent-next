import { createAgent, createMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { z } from 'zod';

import { llmFactory } from './factory';
import libSearch from './tools/lib-search';

const { basic, pro } = llmFactory();

const SYSTEM_PROMPT = `
你是一个界面生成专家，负责根据用户的需求生成界面组件的 JSON 描述。请根据以下规范和可用组件列表，生成符合用户需求的界面描述。

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

export const agent = createAgent({
  model: pro,
  systemPrompt: SYSTEM_PROMPT,
  // tools: [libSearch],
  checkpointer,
  middleware: [middleware]
});
