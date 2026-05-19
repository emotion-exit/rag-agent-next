import type { CSSProperties } from 'react';

export default function Badge({
  props
}: {
  props: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    styles?: Record<string, string>;
  };
}) {
  const variantClass = {
    default: 'border-neutral-300 text-current',
    success: 'border-neutral-300 text-current',
    warning: 'border-neutral-300 text-current',
    error: 'border-neutral-300 text-current',
    info: 'border-neutral-300 text-current'
  }[props.variant ?? 'default'];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs leading-4 ${variantClass}`}
      style={props.styles as CSSProperties}>
      {props.text}
    </span>
  );
}
