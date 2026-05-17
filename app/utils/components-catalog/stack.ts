import { z } from 'zod';

const Stack = {
  description: 'A flex layout container for arranging children',
  props: z
    .object({
      direction: z.enum(['vertical', 'horizontal']).optional(),
      gap: z.enum(['sm', 'md', 'lg']).optional(),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional()
    })
    .describe('Stack组件的属性')
};

const Action = {};

export { Stack, Action };
