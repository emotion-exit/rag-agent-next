import { z } from 'zod';

const TextInput = {
  description: '一个用于接收用户文本输入的组件。',
  props: z
    .object({
      label: z.string().optional(),
      placeholder: z.string().optional(),
      type: z
        .enum(['text', 'email', 'password', 'number', 'textarea'])
        .optional(),
      styles: z.record(z.string(), z.string()).optional()
    })
    .describe('TextInput组件的属性')
};

const Action = {};

export { TextInput, Action };
