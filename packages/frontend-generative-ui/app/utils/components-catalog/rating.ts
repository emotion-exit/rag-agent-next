import { z } from 'zod';

const Rating = {
  description: 'A star rating display component',
  props: z.object({
    label: z.string().optional(),
    max: z.number().optional(),
    value: z.number().optional(),
    styles: z.record(z.string(), z.string()).optional()
  })
};

const Action = {};

export { Rating, Action };
