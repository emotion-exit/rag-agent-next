import type { ChatStreamEvent, RawStreamThunk } from '@/types/base';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isMessageTuple(data: unknown): data is [unknown, unknown] {
  return Array.isArray(data) && data.length >= 1;
}

function getText(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isToolStatusPayload(
  value: unknown
): value is { type: 'tool_status'; text: string; toolName?: string } {
  return (
    isRecord(value) &&
    value.type === 'tool_status' &&
    typeof value.text === 'string'
  );
}

function isToolMessage(message: unknown): boolean {
  return (
    isRecord(message) &&
    typeof message.name === 'string' &&
    'tool_call_id' in message
  );
}

function getToolNameFromBlock(block: unknown): string | undefined {
  if (!isRecord(block)) {
    return undefined;
  }

  const functionCall = isRecord(block.functionCall)
    ? block.functionCall
    : undefined;
  if (functionCall && typeof functionCall.name === 'string') {
    return functionCall.name;
  }

  return undefined;
}

function getToolNameFromMessage(message: unknown): string | undefined {
  if (!isRecord(message)) {
    return undefined;
  }

  if (typeof message.name === 'string' && message.name.length > 0) {
    return message.name;
  }

  if (Array.isArray(message.tool_calls)) {
    for (const toolCall of message.tool_calls) {
      if (isRecord(toolCall) && typeof toolCall.name === 'string') {
        return toolCall.name;
      }
    }
  }

  return undefined;
}

function getContentBlocks(message: unknown): unknown[] {
  if (!isRecord(message)) {
    return [];
  }

  if ('content' in message) {
    const content = message.content;

    if (Array.isArray(content)) {
      return content;
    }

    if (typeof content === 'string' && content.length > 0) {
      return [{ type: 'text', text: content }];
    }
  }

  const additionalKwargs = isRecord(message.additional_kwargs)
    ? message.additional_kwargs
    : undefined;

  const originalTextContentBlock = additionalKwargs
    ? additionalKwargs.originalTextContentBlock
    : undefined;

  if (isRecord(originalTextContentBlock)) {
    return [originalTextContentBlock];
  }

  return [];
}

function normalizeCustomThunk(data: unknown): ChatStreamEvent[] {
  if (typeof data === 'string') {
    const text = data.trim();
    return text
      ? [
          {
            type: 'tool_status',
            text
          }
        ]
      : [];
  }

  if (isToolStatusPayload(data)) {
    return [
      {
        type: 'tool_status',
        text: data.text,
        toolName: data.toolName
      }
    ];
  }

  return [];
}

function normalizeToolMessage(message: unknown): ChatStreamEvent[] {
  const toolName = getToolNameFromMessage(message);

  if (!toolName) {
    return [];
  }

  return [
    {
      type: 'tool_status',
      text: `工具 ${toolName} 已返回结果`,
      toolName
    }
  ];
}

function normalizeContentBlock(
  block: unknown,
  message: unknown
): ChatStreamEvent[] {
  if (!isRecord(block)) {
    return [];
  }

  if (block.type === 'text') {
    const text = getText(block.text);
    if (!text) {
      return [];
    }

    if (block.thought === true) {
      return [
        {
          type: 'reasoning_delta',
          text,
          provider: 'google'
        }
      ];
    }

    return [
      {
        type: 'message_delta',
        text
      }
    ];
  }

  if (block.type === 'functionCall') {
    const toolName =
      getToolNameFromBlock(block) ?? getToolNameFromMessage(message);

    if (!toolName) {
      return [];
    }

    return [
      {
        type: 'tool_status',
        text: `调用工具 ${toolName}`,
        toolName
      }
    ];
  }

  return [];
}

export default function googleAdapter(
  thunk: RawStreamThunk
): ChatStreamEvent[] {
  if (thunk.type === 'custom') {
    return normalizeCustomThunk(thunk.data);
  }

  if (thunk.type !== 'messages' || !isMessageTuple(thunk.data)) {
    return [];
  }

  const [message] = thunk.data;

  if (isToolMessage(message)) {
    return normalizeToolMessage(message);
  }

  const blocks = getContentBlocks(message);
  const events: ChatStreamEvent[] = [];

  for (const block of blocks) {
    events.push(...normalizeContentBlock(block, message));
  }

  return events;
}
