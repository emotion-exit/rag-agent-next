import type { CSSProperties } from 'react';

export default function Text({
  props
}: {
  props: {
    text: string;
    variant?: 'body' | 'caption' | 'label';
    color?: 'default' | 'secondary' | 'muted';
    styles?: Record<string, string>;
  };
}) {
  const variantClass = {
    body: 'text-sm leading-6',
    caption: 'text-xs leading-5',
    label: 'text-sm leading-5'
  }[props.variant ?? 'body'];

  const colorClass = {
    default: 'text-current',
    secondary: 'text-neutral-700',
    muted: 'text-neutral-500'
  }[props.color ?? 'default'];

  return (
    <p
      className={`${variantClass} ${colorClass}`}
      style={props.styles as CSSProperties}>
      {props.text}
    </p>
  );
}
