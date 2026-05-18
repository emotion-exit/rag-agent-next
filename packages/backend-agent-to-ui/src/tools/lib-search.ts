import fs from 'node:fs';
import { tool, type ToolRuntime } from 'langchain';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function resolveLibraryFilePath() {
  const configuredPath = process.env.LIBRARY_FILE_PATH?.trim();
  if (configuredPath) {
    return path.resolve(configuredPath);
  }

  return fileURLToPath(new URL('../../db/lib.txt', import.meta.url));
}

export default tool(
  (_input, config: ToolRuntime) => {
    const writer = config.writer;
    if (writer) {
      writer('正在查询知识库信息...\n\n');
    }

    const filePath = resolveLibraryFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return `这是根据用户提问查询到的知识库信息：${content}\n\n`;
    }

    return '没有找到相关的知识库信息。\n\n';
  },
  {
    name: 'lib-search',
    description: '根据用户的提问，结合知识库中的信息，给出准确、简洁的回答'
  }
);
