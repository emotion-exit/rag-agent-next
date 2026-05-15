import './network';
import { createAgent, createMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';

// factory
import { llmFactory } from './factory';

// tools
import libSearch from './tools/lib-search';

// model
const { basic, pro } = llmFactory();

// system prompt
const SYSTEM_PROMPT = `
你是一个知识库问答专家，你需要根据用户的提问，结合知识库中的信息，给出准确、简洁的回答。
要求：
1. 必须使用lib-search工具来查询知识库中的信息，不能直接回答用户的问题。
2. 每次查询只能使用lib-search工具一次，查询结果必须是用户问题的直接答案，不能包含任何无关的信息。
3. 回答必须简洁明了，避免冗长的解释和无关的信息。
`;

// memory
const checkpointer = new MemorySaver();

// middleware
const midlleware = createMiddleware({
  name: 'dynamic-llm-middleware',
  wrapModelCall(request, handler) {
    const messageCount = request.messages.length;
    // 切换模型，如果连问超过两轮，就切换到basic模型，否则使用pro模型
    if (messageCount < 2) {
      request.model = pro;
    } else {
      request.model = basic;
    }
    return handler(request);
  }
});

// agent
const agent = createAgent({
  model: pro,
  systemPrompt: SYSTEM_PROMPT,
  tools: [libSearch],
  checkpointer,
  middleware: [midlleware]
});

// invoke agent by streaming
async function* chat(userPrompt: string) {
  const stream = await agent.stream(
    {
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    },
    {
      streamMode: ['messages', 'custom'],
      configurable: {
        thread_id: 'great-gatsby-lc'
      }
    }
  );

  for await (const chunk of stream) {
    console.log('Received chunk from agent:', chunk);
    yield chunk;
  }
}

export { chat };
