import type { ReactNode } from 'react';

export default function Stack({
  props,
  children
}: {
  props: {
    direction?: 'vertical' | 'horizontal';
    gap?: 'sm' | 'md' | 'lg';
    align?: 'start' | 'center' | 'end' | 'stretch';
  };
  children?: ReactNode;
}) {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }[props.gap ?? 'md'];

  const directionClass =
    props.direction === 'horizontal' ? 'flex-row' : 'flex-col';

  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }[props.align ?? 'stretch'];

  return (
    <div className={`flex ${directionClass} ${gapClass} ${alignClass}`}>
      {children}
    </div>
  );
}
