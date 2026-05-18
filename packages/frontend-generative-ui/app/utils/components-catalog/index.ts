import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';

import { Card } from './card';
import { Button } from './button';
import { TextInput } from './text-input';
import { Separator } from './separator';
import { Badge } from './badge';
import { Rating } from './rating';
import { Text } from './text';
import { Heading } from './heading';
import { Stack } from './stack';

const catalog = defineCatalog(schema, {
  components: {
    Card,
    Button,
    TextInput,
    Separator,
    Badge,
    Rating,
    Text,
    Heading,
    Stack
  },
  actions: {}
});

export default catalog;
