import { ChatGoogle } from '@langchain/google';
import { ChatOpenRouter } from '@langchain/openrouter';
import { ChatOllama } from '@langchain/ollama';

import { configureProxy, provider } from './env-inject';

type DynamicLLM = {
  basic: ChatOpenRouter | ChatOllama | ChatGoogle;
  pro: ChatOpenRouter | ChatOllama | ChatGoogle;
};

console.log(`Using provider: ${provider}`);

function llmFactory(): DynamicLLM {
  switch (provider) {
    case 'ollama':
      return {
        basic: new ChatOllama({
          model: process.env.OLLAMA_MODEL as string
        }),
        pro: new ChatOllama({
          model: process.env.OLLAMA_MODEL_PRO as string
        })
      };
    case 'google':
      configureProxy('Google');
      return {
        basic: new ChatGoogle({
          model: process.env.GOOGLE_MODEL as string
        }),
        pro: new ChatGoogle({
          model: process.env.GOOGLE_MODEL_PRO as string
        })
      };
    case 'openrouter':
    default:
      configureProxy('OpenRouter');
      return {
        basic: new ChatOpenRouter({
          model: process.env.OPENROUTER_MODEL as string
        }),
        pro: new ChatOpenRouter({
          model: process.env.OPENROUTER_MODEL_PRO as string
        })
      };
  }
}

export { llmFactory };
