import { z } from 'zod';

const Separator = {
  description: 'A horizontal line separator',
  props: z.object({
    margin: z.enum(['sm', 'md', 'lg']).optional(),
    styles: z.record(z.string(), z.string()).optional()
  })
};

const Action = {};

export { Separator, Action };
