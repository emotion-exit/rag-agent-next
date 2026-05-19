import type { CSSProperties } from 'react';

export default function Rating({
  props
}: {
  props: {
    label?: string;
    max?: number;
    value?: number;
    styles?: Record<string, string>;
  };
}) {
  const max = props.max ?? 5;
  const value = Math.max(0, Math.min(props.value ?? 0, max));

  return (
    <div
      className='flex items-center gap-2'
      style={props.styles as CSSProperties}>
      {props.label && <span className='text-sm leading-5'>{props.label}</span>}
      <span aria-label={`rating ${value} out of ${max}`}>
        {Array.from({ length: max }, (_, index) => (
          <span key={index}>{index < value ? '★' : '☆'}</span>
        ))}
      </span>
    </div>
  );
}
