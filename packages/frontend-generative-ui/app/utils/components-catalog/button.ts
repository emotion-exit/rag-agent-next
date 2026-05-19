import { z } from 'zod';

const Button = {
  description: '一个用于触发操作的按钮组件。',
  props: z
    .object({
      label: z.string().describe('按钮上的文本'),
      variant: z.enum(['primary', 'secondary', 'ghost', 'link']).optional(),
      fullWidth: z.boolean().optional(),
      styles: z.record(z.string(), z.string()).optional()
    })
    .describe('Button组件的属性')
};

const Action = {};

export { Button, Action };
