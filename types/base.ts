export type ChatStreamEvent =
  | {
      type: ChatStreamEventType[0];
      text: string;
    }
  | {
      type: ChatStreamEventType[1];
      text: string;
      provider: Provider;
    }
  | {
      type: ChatStreamEventType[2];
      text: string;
      toolName?: string;
    }
  | {
      type: ChatStreamEventType[3];
      text: string;
    }
  | {
      type: ChatStreamEventType[4];
      text: string;
    };

export type Provider = 'google' | 'openrouter' | 'ollama';

export type RawStreamThunk = {
  type: string;
  data: unknown;
};

export type ChatStreamEventType =
  | 'message_delta'
  | 'reasoning_delta'
  | 'tool_status'
  | 'done'
  | 'error';
