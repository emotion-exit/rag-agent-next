import { z } from 'zod';

const Separator = {
  description: 'A horizontal line separator',
  props: z.object({
    margin: z.enum(['sm', 'md', 'lg']).optional()
  })
};

const Action = {};

export { Separator, Action };
