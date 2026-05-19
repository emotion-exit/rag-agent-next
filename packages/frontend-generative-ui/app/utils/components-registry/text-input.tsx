import type { CSSProperties } from 'react';

export default function TextInput({
  props
}: {
  props: {
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
    label?: string;
    placeholder?: string;
    styles?: Record<string, string>;
  };
}) {
  const inputClass =
    'rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm leading-5 outline-none';

  return (
    <div
      className='flex w-full flex-col gap-2'
      style={props.styles as CSSProperties}>
      {props.label && (
        <label className='text-sm leading-5'>{props.label}</label>
      )}
      {props.type === 'textarea' ? (
        <textarea
          className={inputClass}
          placeholder={props.placeholder}
          rows={4}
        />
      ) : (
        <input
          className={inputClass}
          type={props.type ?? 'text'}
          placeholder={props.placeholder}
        />
      )}
    </div>
  );
}
