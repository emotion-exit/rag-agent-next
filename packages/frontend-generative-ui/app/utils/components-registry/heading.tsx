import type { CSSProperties, ReactNode } from 'react';

export default function Heading({
  props,
  children
}: {
  props: {
    direction?: 'vertical' | 'horizontal';
    gap?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
    styles?: Record<string, string>;
  };
  children?: ReactNode;
}) {
  const gapClass = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }[props.gap ?? 'sm'];

  const directionClass =
    props.direction === 'horizontal' ? 'flex-row' : 'flex-col';

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }[props.align ?? 'start'];

  return (
    <div
      className={`flex ${directionClass} ${gapClass} ${alignClass}`}
      style={props.styles as CSSProperties}>
      {children}
    </div>
  );
}
