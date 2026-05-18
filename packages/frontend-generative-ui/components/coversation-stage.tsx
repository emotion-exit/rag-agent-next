'use client';

import { useStream } from '@langchain/react';
import { AIMessage } from '@langchain/core/messages';
import { useState, type FormEvent, type KeyboardEvent } from 'react';

import {
  registry,
  JSONUIProvider,
  Renderer
} from '@/app/utils/components-registry';

type JSONUIElement = {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
};

type JSONUISpec = {
  root: string;
  elements: Record<string, JSONUIElement>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJSONUIElement(value: unknown): value is JSONUIElement {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.type !== 'string' || !isRecord(value.props)) {
    return false;
  }

  if (value.children == null) {
    return true;
  }

  return (
    Array.isArray(value.children) &&
    value.children.every((child) => typeof child === 'string')
  );
}

function toJSONUISpec(value: unknown): JSONUISpec | null {
  if (
    !isRecord(value) ||
    typeof value.root !== 'string' ||
    !isRecord(value.elements)
  ) {
    return null;
  }

  const safeElements: Record<string, JSONUIElement> = {};

  for (const [key, element] of Object.entries(value.elements)) {
    if (isJSONUIElement(element)) {
      safeElements[key] = element;
    }
  }

  if (!safeElements[value.root]) {
    return null;
  }

  return {
    root: value.root,
    elements: safeElements
  };
}

export default function GenerativeUI() {
  const [prompt, setPrompt] = useState(
    '帮我生成一个包含标题、评分、标签和操作按钮的商品卡片'
  );
  const serviceUrl = process.env.NEXT_PUBLIC_AGENT_API_URL;
  const stream = useStream({
    apiUrl: serviceUrl,
    assistantId: 'assistant-1'
  });

  const handleSubmit = async (text: string) => {
    const nextPrompt = text.trim();
    if (!nextPrompt) {
      return;
    }

    await stream.submit({
      messages: [{ type: 'human', content: nextPrompt }]
    });
    setPrompt('');
  };

  const aiMessage = [...stream.messages].reverse().find(AIMessage.isInstance);
  const rawSpec = aiMessage?.tool_calls?.[0]?.args;
  const spec = toJSONUISpec(rawSpec);
  const errorMessage =
    stream.error instanceof Error
      ? stream.error.message
      : typeof stream.error === 'string'
        ? stream.error
        : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(prompt);
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#f6f1e8]'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(246,241,232,0.72)_42%,_rgba(228,218,200,0.96)_100%)]' />

      <section className='relative flex min-h-screen items-center justify-center px-6 pb-40 pt-10'>
        <div className='w-full max-w-6xl'>
          {spec ? (
            <JSONUIProvider registry={registry}>
              <div className='min-h-[70vh] rounded-[2rem] border border-black/10 bg-white/72 p-8 shadow-[0_30px_120px_rgba(66,44,22,0.12)] backdrop-blur-sm'>
                <Renderer
                  spec={spec}
                  registry={registry}
                  loading={stream.isLoading}
                />
              </div>
            </JSONUIProvider>
          ) : (
            <div className='flex min-h-[70vh] items-center justify-center rounded-[2rem] border border-dashed border-black/15 bg-white/45 px-5 py-8 text-center text-sm leading-6 text-neutral-600 backdrop-blur-sm'>
              生成结果会显示在这里。当前还没有拿到可渲染的 JSON UI spec。
            </div>
          )}

          {errorMessage && (
            <div className='mx-auto mt-4 max-w-3xl rounded-2xl border border-red-200 bg-red-50/95 px-4 py-3 text-sm text-red-700 shadow-sm'>
              {errorMessage}
            </div>
          )}
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className='pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-6'>
        <div className='pointer-events-auto w-full max-w-3xl rounded-[1.75rem] border border-black/10 bg-white/85 p-4 shadow-[0_20px_60px_rgba(30,20,10,0.18)] backdrop-blur-md'>
          <textarea
            value={prompt}
            placeholder='描述你要生成的 UI，例如：生成一个带标题、评分、价格和购买按钮的商品卡片'
            className='min-h-28 w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-400'
            onChange={(event) => {
              setPrompt(event.target.value);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit(prompt);
              }
            }}
          />

          <div className='mt-3 flex items-center justify-between gap-3 border-t border-black/5 px-2 pt-3'>
            <p className='text-xs text-neutral-500'>
              Enter 发送，Shift + Enter 换行
            </p>

            <button
              type='submit'
              className='rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300'
              disabled={stream.isLoading || prompt.trim() === ''}>
              {stream.isLoading ? '生成中...' : '生成界面'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
