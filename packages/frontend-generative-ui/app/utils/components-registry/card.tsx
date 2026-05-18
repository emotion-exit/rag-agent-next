import type { ReactNode } from 'react';

export default function Card({
  props,
  children
}: {
  props: {
    title?: string;
    content: string;
    padding?: '0' | '8px' | '16px' | '24px' | '32px';
    borderRadius?: '0' | '4px' | '8px' | '16px';
    shadow?: 'none' | 'small' | 'medium' | 'large';
  };
  children?: ReactNode;
}) {
  const shadowClass = {
    none: 'shadow-none',
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg'
  }[props.shadow ?? 'medium'];

  return (
    <div
      className={`rounded border border-black/10 bg-white ${shadowClass}`}
      style={{
        padding: props.padding ?? '16px',
        borderRadius: props.borderRadius ?? '8px'
      }}>
      {props.title && (
        <h2 className='mb-2 text-lg font-semibold'>{props.title}</h2>
      )}
      <p className='text-sm leading-6 text-neutral-700'>{props.content}</p>
      {children}
    </div>
  );
}
