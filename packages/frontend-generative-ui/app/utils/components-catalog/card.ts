import { z } from 'zod';

const Card = {
  description: '一个可用于以结构化格式显示内容的卡片组件。',
  props: z
    .object({
      title: z.string().optional().describe('卡片的标题'),
      content: z.string().describe('卡片的主要内容'),
      padding: z
        .enum(['0', '8px', '16px', '24px', '32px'])
        .default('16px')
        .describe('卡片内容的内边距'),
      borderRadius: z
        .enum(['0', '4px', '8px', '16px'])
        .default('8px')
        .describe('卡片的边框圆角'),
      shadow: z
        .enum(['none', 'small', 'medium', 'large'])
        .default('medium')
        .describe('卡片的阴影效果'),
      styles: z.record(z.string(), z.string()).optional()
    })
    .describe('Card组件的属性')
};

const Action = {};

export { Card, Action };
