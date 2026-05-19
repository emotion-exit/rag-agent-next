import type { CSSProperties, ReactNode } from 'react';

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
    styles?: Record<string, string>;
  };
  children?: ReactNode;
}) {
  const shadowClass = {
    none: 'shadow-none',
    small: 'shadow-sm',
    medium: 'shadow-sm',
    large: 'shadow-md'
  }[props.shadow ?? 'none'];

  return (
    <div
      className={`rounded border border-neutral-200 bg-white ${shadowClass}`}
      style={{
        padding: props.padding ?? '16px',
        borderRadius: props.borderRadius ?? '8px',
        ...(props.styles as CSSProperties)
      }}>
      {props.title && (
        <h2 className='mb-2 text-base font-medium leading-6'>{props.title}</h2>
      )}
      {props.content && <p className='text-sm leading-6'>{props.content}</p>}
      {children}
    </div>
  );
}
