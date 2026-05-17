import { defineRegistry, Renderer, JSONUIProvider } from '@json-render/react';
import catalog from '@/app/utils/components-catalog';

import Badge from './badge';
import Heading from './heading';
import Rating from './rating';
import Separator from './separator';
import Stack from './stack';
import Text from './text';
import Card from './card';
import Button from './button';
import TextInput from './text-input';

const { registry } = defineRegistry(catalog, {
  components: {
    Card: ({ props, children }) => Card({ props, children }),
    Button: ({ props }) => Button({ props }),
    TextInput: ({ props }) => TextInput({ props }),
    Separator: ({ props }) => Separator({ props }),
    Badge: ({ props }) => Badge({ props }),
    Rating: ({ props }) => Rating({ props }),
    Text: ({ props }) => Text({ props }),
    Heading: ({ props, children }) => Heading({ props, children }),
    Stack: ({ props, children }) => Stack({ props, children })
  }
});

export { registry, Renderer, JSONUIProvider };
