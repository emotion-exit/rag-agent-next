export default function TextInput({
  props
}: {
  props: {
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
    label?: string;
    placeholder?: string;
  };
}) {
  const inputClass =
    'rounded border border-neutral-300 px-3 py-2 text-sm outline-none';

  return (
    <div className='flex w-full flex-col gap-2'>
      {props.label && (
        <label className='text-sm font-medium'>{props.label}</label>
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
