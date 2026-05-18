export default function Rating({
  props
}: {
  props: {
    label?: string;
    max?: number;
    value?: number;
  };
}) {
  const max = props.max ?? 5;
  const value = Math.max(0, Math.min(props.value ?? 0, max));

  return (
    <div className='flex items-center gap-2 text-amber-500'>
      {props.label && (
        <span className='text-sm font-medium text-neutral-800'>
          {props.label}
        </span>
      )}
      <span aria-label={`rating ${value} out of ${max}`}>
        {Array.from({ length: max }, (_, index) => (
          <span key={index}>{index < value ? '★' : '☆'}</span>
        ))}
      </span>
    </div>
  );
}
