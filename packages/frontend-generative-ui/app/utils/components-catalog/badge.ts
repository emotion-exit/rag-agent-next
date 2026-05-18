import { z } from 'zod';

const Badge = {
  description: 'A small badge/tag element',
  props: z.object({
    text: z.string(),
    variant: z
      .enum(['default', 'success', 'warning', 'error', 'info'])
      .optional()
  })
};

const Action = {};

export { Badge, Action };
