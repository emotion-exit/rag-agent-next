import { chat } from '../../../backend/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatRequestBody = {
  message?: string;
};

const responseHeaders = {
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'Content-Type': 'text/event-stream; charset=utf-8',
  'X-Accel-Buffering': 'no'
};

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const message = body.message?.trim();

  if (!message) {
    return Response.json({ error: 'Message is required.' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let _id = 0;
      try {
        for await (const chunk of chat(message)) {
          if (chunk.type === 'messages') {
            controller.enqueue(
              encoder.encode(
                `id:${_id++}\nevent:${chunk.type}\ndata:${JSON.stringify((chunk as { data: () => { content: string } }).data().content)}\n\n`
              )
            );
          }
          if (chunk.type === 'custom') {
            controller.enqueue(
              encoder.encode(
                `id:${_id++}\nevent:${chunk.type}\ndata:${JSON.stringify(chunk.data())}\n\n`
              )
            );
          }
        }

        controller.enqueue(
          encoder.encode(`id:${_id++}\nevent:done\ndata:\n\n`)
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        controller.enqueue(
          encoder.encode(
            `id:${_id++}\nevent:error\ndata:${JSON.stringify(errorMessage)}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: responseHeaders
  });
}
