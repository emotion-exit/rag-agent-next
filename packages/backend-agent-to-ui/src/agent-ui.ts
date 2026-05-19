import { createAgent, createMiddleware } from 'langchain';
import { MemorySaver } from '@langchain/langgraph';
import { z } from 'zod';

import { llmFactory } from './factory';
import libSearch from './tools/lib-search';

const { basic, pro } = llmFactory();

const SYSTEM_PROMPT = `
You are a UI generator. Given a natural language description, generate a json-render spec that describes the UI.

Your output must be directly consumable by the frontend parser.
Return one json-render spec object only. Do not add explanations, markdown, code fences, comments, or any wrapper object.
The response must be a plain object with exactly this top-level shape:
{
  "root": "some-id",
  "elements": {
    "some-id": {
      "type": "Card",
      "props": {},
      "children": []
    }
  }
}

Strict output requirements:
- "root" must be a string.
- "elements" must be an object map, never a JSON string.
- Every value inside "elements" must be an object, never a JSON string.
- Every element object must contain exactly these required fields: "type", "props", "children".
- "type" must be a string.
- "props" must always be an object. Use {} when there are no props.
- "children" must always be an array of string IDs. Use [] for leaf nodes.
- The root ID must exist inside "elements".
- Every child ID referenced in "children" must also exist inside "elements".
- Never return partially broken JSON, duplicated keys, or dangling objects.
- Never serialize nested objects as strings.
- Never put the spec inside a text field such as "content", "answer", or "data".

Available components:
- Card: A structured card container. Props: title (string, optional), content (string, optional), padding ("0" | "8px" | "16px" | "24px" | "32px", optional), borderRadius ("0" | "4px" | "8px" | "16px", optional), shadow ("none" | "small" | "medium" | "large", optional), styles (record of CSS property names to string values, optional)
- Stack: Flex layout container. Props: direction ("vertical" | "horizontal", optional), gap ("sm" | "md" | "lg", optional), align ("start" | "center" | "end" | "stretch", optional), styles (record of CSS property names to string values, optional)
- Heading: A heading-styled flex container for arranging children. Props: direction ("vertical" | "horizontal", optional), gap ("sm" | "md" | "lg", optional), align ("start" | "center" | "end" | "stretch", optional), styles (record of CSS property names to string values, optional)
- Text: Text content for paragraphs, labels, or captions. Props: text (string), variant ("body" | "caption" | "label", optional), color ("default" | "secondary" | "muted", optional), styles (record of CSS property names to string values, optional)
- TextInput: Form input. Props: label (string, optional), placeholder (string, optional), type ("text" | "email" | "password" | "number" | "textarea", optional), styles (record of CSS property names to string values, optional)
- Button: Clickable button. Props: label (string), variant ("primary" | "secondary" | "ghost" | "link", optional), fullWidth (boolean, optional), styles (record of CSS property names to string values, optional)
- Separator: Horizontal line. Props: margin ("sm" | "md" | "lg", optional), styles (record of CSS property names to string values, optional)
- Badge: Small badge/tag element. Props: text (string), variant ("default" | "success" | "warning" | "error" | "info", optional), styles (record of CSS property names to string values, optional)
- Rating: Star rating display. Props: label (string, optional), max (number, optional), value (number, optional), styles (record of CSS property names to string values, optional)

Rules:
- The spec has a "root" key pointing to the root element ID.
- The "elements" map contains all elements, keyed by unique IDs.
- Each element has "type" (component name), "props" (component props), and "children" (array of child element IDs).
- Use descriptive IDs like "card-1", "email-input", "submit-btn".
- Produce valid JSON that can be parsed without repair.
- Prefer stable, simple element trees over overly complex nested structures.
- Only use the component props listed above. Do not invent extra props.
- The built-in component defaults are intentionally minimal. Use styles to control visual hierarchy, spacing, colors, borders, radii, backgrounds, sizing, and positioning.
- Do not rely on variant, color, or shadow props alone to create the final look of the page. Prefer explicit styles whenever visual appearance matters.
- If you use styles, use standard CSS property names as keys and string values.
- Leaf components (TextInput, Button, Text, Badge, Rating, Separator) typically have empty children arrays.
- Container components (Card, Stack, Heading) have children arrays referencing other element IDs.
- Always wrap the UI in a Card as the root element.
- Use Stack components for layout, and add styles to make layout intent explicit.
`;

const checkpointer = new MemorySaver();

const middleware = createMiddleware({
  name: 'dynamic-llm-middleware',
  wrapModelCall(request, handler) {
    request.model = request.messages.length < 2 ? pro : basic;
    return handler(request);
  }
});

const ElementSchema = z.object({
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  children: z.array(z.string())
});

export const SpecSchema = z.object({
  root: z.string(),
  elements: z.record(z.string(), ElementSchema)
});

export type GenerateUISpec = z.infer<typeof SpecSchema>;

export const agent = createAgent({
  model: pro,
  systemPrompt: SYSTEM_PROMPT,
  // tools: [libSearch],
  checkpointer,
  middleware: [middleware],
  responseFormat: SpecSchema
});
