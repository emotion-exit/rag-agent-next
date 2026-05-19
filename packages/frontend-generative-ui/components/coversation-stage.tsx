'use client';

import { useStream } from '@langchain/react';
import { AIMessage } from '@langchain/core/messages';
import { useState, type KeyboardEvent } from 'react';
import {
  registry,
  JSONUIProvider,
  Renderer
} from '@/app/utils/components-registry';

export default function GenerativeUI() {
  const [prompt, setPrompt] = useState('生成好看的暗黑4职业卡片');
  const serviceUrl = process.env.NEXT_PUBLIC_AGENT_API_URL;
  const stream = useStream({
    apiUrl: serviceUrl,
    assistantId: 'generative_ui'
  });

  const handleSubmit = () => {
    stream.submit({
      messages: [{ type: 'human', content: prompt }]
    });
    setPrompt('');
  };

  const aiMessage = stream.messages.find(AIMessage.isInstance);
  const rawSpec = aiMessage?.tool_calls?.[0]?.args;
  const spec = (() => {
    if (!rawSpec?.root || !rawSpec?.elements) return null;
    const rootEl = rawSpec.elements[rawSpec.root];
    if (!rootEl?.type || rootEl?.props == null) return null;

    const safeElements = {};
    for (const [key, el] of Object.entries(rawSpec.elements)) {
      if (el?.type && el?.props != null) {
        safeElements[key] = el;
      }
    }
    return { root: rawSpec.root, elements: safeElements };
  })();
  return (
    <div className='relative min-h-screen overflow-hidden '>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 opacity-70 [background-image:url("/canvas-dots.svg")] [background-repeat:repeat]'
      />

      <div className='relative z-0'>
        {spec && (
          <JSONUIProvider registry={registry}>
            <Renderer
              spec={spec}
              registry={registry}
              loading={stream.isLoading}
            />
          </JSONUIProvider>
        )}
      </div>

      <div className='pointer-events-none fixed inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-6'>
        <div className='pointer-events-auto w-full max-w-3xl rounded-[1.75rem] border border-black/10 bg-white/85 p-4 shadow-[0_20px_60px_rgba(30,20,10,0.18)] backdrop-blur-md'>
          <textarea
            value={prompt}
            className='min-h-28 w-full resize-none bg-transparent px-2 py-2 text-sm leading-6 text-neutral-900 outline-none placeholder:text-neutral-400'
            onChange={(event) => {
              setPrompt(event.target.value);
            }}
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
          />

          <div className='mt-3 flex items-center justify-between gap-3 border-t border-black/5 px-2 pt-3'>
            <p className='text-xs text-neutral-500'>
              Enter 发送，Shift + Enter 换行
            </p>

            <button
              onClick={handleSubmit}
              className='rounded-full bg-neutral-950 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-neutral-300'
              disabled={stream.isLoading || prompt.trim() === ''}>
              {stream.isLoading ? '生成中...' : '生成界面'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
