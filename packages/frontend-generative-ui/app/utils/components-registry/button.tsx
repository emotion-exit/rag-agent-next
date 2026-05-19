import type { CSSProperties } from 'react';

export default function Button({
  props
}: {
  props: {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    label: string;
    fullWidth?: boolean;
    styles?: Record<string, string>;
  };
}) {
  const variantClass = {
    primary: 'border-neutral-300 bg-transparent text-current',
    secondary: 'border-neutral-300 bg-transparent text-current',
    ghost: 'border-transparent bg-transparent text-current',
    link: 'rounded-none border-transparent bg-transparent p-0 underline underline-offset-2 text-current'
  }[props.variant ?? 'primary'];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm leading-5 ${variantClass} ${props.fullWidth ? 'w-full' : ''}`}
      style={props.styles as CSSProperties}>
      {props.label}
    </button>
  );
}
