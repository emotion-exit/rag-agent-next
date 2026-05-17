type TransportEvent = {
  id?: string;
  event: string;
  data: unknown;
};

type TransportPayload = {
  input: Record<string, unknown> | null | undefined;
  context?: Record<string, unknown>;
  command?: unknown;
  config?: Record<string, unknown>;
  streamSubgraphs?: boolean;
  signal: AbortSignal;
};

const DEFAULT_SERVICE_URL = 'http://localhost:2024';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function parseEventBlock(block: string): TransportEvent | null {
  const lines = block.split(/\r?\n/);
  let event = 'message';
  let id: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      continue;
    }

    if (line.startsWith('id:')) {
      id = line.slice(3).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  return {
    id,
    event,
    data: JSON.parse(dataLines.join('\n'))
  };
}

async function* parseEventStream(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<TransportEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        const event = parseEventBlock(block);
        if (event) {
          yield event;
        }
      }

      if (done) {
        break;
      }
    }

    if (buffer.trim()) {
      const event = parseEventBlock(buffer);
      if (event) {
        yield event;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function getLangChainServiceUrl() {
  return process.env.NEXT_PUBLIC_LANGCHAIN_SERVICE_URL ?? DEFAULT_SERVICE_URL;
}

function createLangChainServiceTransport(baseUrl = getLangChainServiceUrl()) {
  return {
    async stream(payload: TransportPayload) {
      const { signal, ...requestBody } = payload;
      const response = await fetch(`${normalizeBaseUrl(baseUrl)}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        body: JSON.stringify(requestBody),
        signal
      });

      if (!response.ok) {
        let message = `Agent service request failed with ${response.status}`;

        try {
          const data = (await response.json()) as { error?: string };
          if (typeof data.error === 'string' && data.error.length > 0) {
            message = data.error;
          }
        } catch {
          // Ignore JSON parse failures and keep the status-based message.
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error('Agent service did not return a stream body.');
      }

      return parseEventStream(response.body);
    }
  };
}

export { createLangChainServiceTransport, getLangChainServiceUrl };
