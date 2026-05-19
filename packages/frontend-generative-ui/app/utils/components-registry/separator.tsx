import type { CSSProperties } from 'react';

export default function Separator({
  props
}: {
  props: {
    margin?: 'sm' | 'md' | 'lg';
    styles?: Record<string, string>;
  };
}) {
  const marginClass = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6'
  }[props.margin ?? 'md'];

  return (
    <hr
      className={`w-full border-neutral-300 ${marginClass}`}
      style={props.styles as CSSProperties}
    />
  );
}
