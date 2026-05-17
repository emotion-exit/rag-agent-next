'use client';

import { useStream } from '@langchain/react';
import { AIMessage } from '@langchain/core/messages';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent
} from 'react';

import {
  registry,
  JSONUIProvider,
  Renderer
} from '@/app/utils/components-registry';
import {
  createLangChainServiceTransport,
  getLangChainServiceUrl
} from '@/lib/langchain-service-transport';

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

function getMessageText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if (!isRecord(part)) {
        return '';
      }

      if (typeof part.text === 'string') {
        return part.text;
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export default function GenerativeUI() {
  const [prompt, setPrompt] = useState(
    '帮我生成一个包含标题、评分、标签和操作按钮的商品卡片'
  );
  const serviceUrl = getLangChainServiceUrl();
  const transport = useMemo(
    () => createLangChainServiceTransport(serviceUrl),
    [serviceUrl]
  );
  const stream = useStream({
    transport
  });
  const listRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [spec, stream.isLoading, stream.messages]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(prompt);
  }

  return (
    <div className='mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-6 py-8'>
      <section className='flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm'>
        <header className='border-b border-black/5 px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='space-y-1'>
              <p className='text-xs font-medium uppercase tracking-[0.2em] text-neutral-500'>
                Generative UI
              </p>
              <h1 className='text-2xl font-semibold text-neutral-950'>
                LangChain UI Playground
              </h1>
              <p className='text-sm text-neutral-600'>
                输入需求后，左侧保留消息轨迹，右侧渲染最新生成的 JSON UI。
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-2 text-xs text-neutral-600'>
              <span className='rounded-full bg-neutral-100 px-3 py-1'>
                service: {serviceUrl}
              </span>
              <span className='rounded-full bg-neutral-100 px-3 py-1'>
                {stream.threadId
                  ? `thread: ${stream.threadId}`
                  : 'thread: pending'}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${
                  stream.isLoading
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                {stream.isLoading ? 'streaming' : 'idle'}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              {errorMessage}
            </div>
          )}
        </header>

        <div
          ref={listRef}
          className='flex-1 space-y-4 overflow-y-auto bg-neutral-50/70 px-6 py-6'>
          {stream.messages.length === 0 && (
            <div className='rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-10 text-center text-sm text-neutral-500'>
              还没有消息。先描述你要生成的界面，例如表单、商品卡片或统计面板。
            </div>
          )}

          {stream.messages.map((message, index) => {
            const isAssistant = AIMessage.isInstance(message);
            const text = getMessageText(message.content);

            return (
              <article
                key={message.id ?? `${message.getType()}-${index}`}
                className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${
                    isAssistant
                      ? 'bg-white text-neutral-800'
                      : 'bg-neutral-900 text-neutral-50'
                  }`}>
                  <div className='mb-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-400'>
                    {isAssistant ? 'assistant' : 'user'}
                  </div>
                  <div className='whitespace-pre-wrap text-sm leading-6'>
                    {text || '该消息当前没有可直接展示的文本内容。'}
                  </div>
                </div>
              </article>
            );
          })}

          {stream.isLoading && (
            <div className='flex justify-start'>
              <div className='rounded-3xl bg-white px-4 py-3 text-sm text-neutral-500 shadow-sm'>
                正在生成界面结构...
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className='border-t border-black/5 bg-white p-4'>
          <div className='rounded-3xl border border-black/10 bg-neutral-50 p-3'>
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

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  className='rounded-full border border-black/10 px-4 py-2 text-sm text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={!stream.isLoading}
                  onClick={() => {
                    void stream.stop();
                  }}>
                  停止
                </button>
                <button
                  type='submit'
                  className='rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300'
                  disabled={stream.isLoading || prompt.trim() === ''}>
                  生成界面
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      <aside className='flex w-105 min-w-90 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm'>
        <header className='border-b border-black/5 px-5 py-4'>
          <p className='text-xs font-medium uppercase tracking-[0.2em] text-neutral-500'>
            Preview
          </p>
          <h2 className='mt-1 text-lg font-semibold text-neutral-950'>
            Generated UI
          </h2>
        </header>

        <div className='flex-1 overflow-y-auto p-5'>
          {spec ? (
            <JSONUIProvider registry={registry}>
              <div className='rounded-3xl border border-black/10 bg-neutral-50 p-4'>
                <Renderer
                  spec={spec}
                  registry={registry}
                  loading={stream.isLoading}
                />
              </div>
            </JSONUIProvider>
          ) : (
            <div className='rounded-3xl border border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-sm leading-6 text-neutral-500'>
              生成结果会显示在这里。当前还没有拿到可渲染的 JSON UI spec。
            </div>
          )}

          <div className='mt-4 rounded-3xl border border-black/5 bg-neutral-950 p-4 text-xs text-neutral-200'>
            <div className='mb-2 font-medium text-neutral-400'>
              Latest raw spec
            </div>
            <pre className='overflow-x-auto whitespace-pre-wrap wrap-break-word'>
              {rawSpec ? JSON.stringify(rawSpec, null, 2) : '暂无结构化输出'}
            </pre>
          </div>
        </div>
      </aside>
    </div>
  );
}
