import { ChatGoogle } from '@langchain/google';
import { ChatOpenRouter } from '@langchain/openrouter';
import { ChatOllama } from '@langchain/ollama';

type dynamicLLM = {
  basic: ChatOpenRouter | ChatOllama | ChatGoogle;
  pro: ChatOpenRouter | ChatOllama | ChatGoogle;
};

const _provider = process.env.PROVIDER || 'openrouter';

console.log(`Using provider: ${_provider}`);

function llmFactory(): dynamicLLM {
  switch (_provider) {
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
