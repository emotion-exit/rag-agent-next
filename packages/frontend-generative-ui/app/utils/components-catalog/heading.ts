import { z } from 'zod';

const Heading = {
  description: 'A flex layout container for arranging children',
  props: z.object({
    direction: z.enum(['vertical', 'horizontal']).optional(),
    gap: z.enum(['sm', 'md', 'lg']).optional(),
    align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
    styles: z.record(z.string(), z.string()).optional()
  })
};

const Action = {};

export { Heading, Action };
