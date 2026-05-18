export default function Badge({
  props
}: {
  props: {
    text: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };
}) {
  const variantClass = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800'
  }[props.variant ?? 'default'];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${variantClass}`}>
      {props.text}
    </span>
  );
}
