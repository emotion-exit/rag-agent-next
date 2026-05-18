import { tool, type ToolRuntime } from 'langchain';
import fs from 'fs';
import path from 'path';
export default tool(
  (input, config: ToolRuntime) => {
    const writer = config.writer;
    // 流式输出tool的结果
    if (writer) {
      writer('正在查询知识库信息...\n\n');
    }

    // 查询文件内容
    const filePath = path.join(process.cwd(), 'db/lib.txt');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // 简单模拟查询，实际可以替换成真正的数据库查询逻辑
      return `这是根据用户提问查询到的知识库信息：${content}\n\n`;
    }
    return `没有找到相关的知识库信息。\n\n`;
  },
  {
    name: 'lib-search',
    description: '根据用户的提问，结合知识库中的信息，给出准确、简洁的回答'
  }
);
