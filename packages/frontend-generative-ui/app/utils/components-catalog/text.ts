import { z } from 'zod';

const Text = {
  description: 'A text element for paragraphs, labels, or captions',
  props: z.object({
    text: z.string(),
    variant: z.enum(['body', 'caption', 'label']).optional(),
    color: z.enum(['default', 'secondary', 'muted']).optional(),
    styles: z.record(z.string(), z.string()).optional()
  })
};

const Action = {};

export { Text, Action };
