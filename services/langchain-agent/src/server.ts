import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';

import { streamAgent, type AgentStreamPayload } from './agent-ui.js';

const port = Number(process.env.AGENT_SERVICE_PORT ?? process.env.PORT ?? 2024);
const allowOrigin = process.env.WEB_ORIGIN?.trim() || '*';

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

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: allowOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

app.get('/health', async () => ({ ok: true }));

app.post<{ Body: AgentStreamPayload }>('/stream', async (request, reply) => {
  const run = await streamAgent(request.body ?? {});
  let connectionClosed = false;

  request.raw.on('close', () => {
    connectionClosed = true;
  });

  reply.hijack();
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive'
  });
  reply.raw.flushHeaders?.();

  try {
    for await (const chunk of run) {
      if (connectionClosed) {
        break;
      }

      if (Array.isArray(chunk)) {
        const [event, data] = chunk;
        writeSseEvent(reply.raw, String(event), data);
        continue;
      }

      writeSseEvent(reply.raw, 'values', chunk);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    writeSseEvent(reply.raw, 'error', { message });
  } finally {
    reply.raw.end();
  }
});

await app.listen({
  port,
  host: '0.0.0.0'
});
