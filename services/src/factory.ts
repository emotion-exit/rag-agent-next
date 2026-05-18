import { ChatGoogle } from '@langchain/google';
import { ChatOpenRouter } from '@langchain/openrouter';
import { ChatOllama } from '@langchain/ollama';

import { ProxyAgent, setGlobalDispatcher } from 'undici';
import dotenv from 'dotenv';

dotenv.config();

type DynamicLLM = {
  basic: ChatOpenRouter | ChatOllama | ChatGoogle;
  pro: ChatOpenRouter | ChatOllama | ChatGoogle;
};

const provider = process.env.PROVIDER || 'openrouter';

console.log(`Using provider: ${provider}`);

const USE_PROXY = process.env.USE_PROXY === 'true';

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
      if (USE_PROXY) {
        const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
        if (proxyUrl) {
          setGlobalDispatcher(new ProxyAgent(proxyUrl));
          console.log(
            `Proxy dispatcher configured for Google provider using ${proxyUrl}`
          );
        } else {
          console.warn(
            'USE_PROXY is true but no proxy URL is configured for Google provider.'
          );
        }
      }
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
      if (USE_PROXY) {
        const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
        if (proxyUrl) {
          setGlobalDispatcher(new ProxyAgent(proxyUrl));
          console.log(
            `Proxy dispatcher configured for OpenRouter provider using ${proxyUrl}`
          );
        } else {
          console.warn(
            'USE_PROXY is true but no proxy URL is configured for OpenRouter provider.'
          );
        }
      }
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
