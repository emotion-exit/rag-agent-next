import 'dotenv/config';
import { createServer } from 'node:http';

import { streamAgent, type AgentStreamPayload } from './agent-ui.js';

const port = Number(process.env.AGENT_SERVICE_PORT ?? process.env.PORT ?? 2024);
const allowOrigin = process.env.WEB_ORIGIN?.trim() || '*';

function setCorsHeaders(response: import('node:http').ServerResponse) {
  response.setHeader('Access-Control-Allow-Origin', allowOrigin);
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

async function readJsonBody(
  request: import('node:http').IncomingMessage
): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function writeJson(
  response: import('node:http').ServerResponse,
  status: number,
  body: Record<string, unknown>
) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(body));
}

function writeSseEvent(
  response: import('node:http').ServerResponse,
  event: string,
  data: unknown,
  id?: string
) {
  if (id) {
    response.write(`id: ${id}\n`);
  }

  response.write(`event: ${event}\n`);

  const serialized = JSON.stringify(data);
  for (const line of serialized.split(/\r?\n/)) {
    response.write(`data: ${line}\n`);
  }

  response.write('\n');
}

const server = createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', 'http://localhost');

  if (request.method === 'GET' && url.pathname === '/health') {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/stream') {
    try {
      const payload = (await readJsonBody(request)) as AgentStreamPayload;
      const run = await streamAgent(payload);
      let connectionClosed = false;

      request.on('close', () => {
        connectionClosed = true;
      });

      response.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      });
      response.flushHeaders();

      for await (const chunk of run) {
        if (connectionClosed) {
          break;
        }

        if (Array.isArray(chunk)) {
          const [event, data] = chunk;
          writeSseEvent(response, String(event), data);
          continue;
        }

        writeSseEvent(response, 'values', chunk);
      }

      response.end();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      if (!response.headersSent) {
        writeJson(response, 500, { error: message });
        return;
      }

      writeSseEvent(response, 'error', { message });
      response.end();
      return;
    }
  }

  writeJson(response, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`LangChain agent service listening on http://localhost:${port}`);
});
