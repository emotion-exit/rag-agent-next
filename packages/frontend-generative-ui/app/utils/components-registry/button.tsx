export default function Button({
  props
}: {
  props: {
    variant?: 'primary' | 'secondary' | 'ghost' | 'link';
    label: string;
    fullWidth?: boolean;
  };
}) {
  const variantClass = {
    primary: 'bg-black text-white',
    secondary: 'bg-neutral-200 text-neutral-900',
    ghost: 'bg-transparent text-neutral-900 border border-neutral-300',
    link: 'bg-transparent text-blue-600 underline p-0'
  }[props.variant ?? 'primary'];

  return (
    <button
      className={`rounded px-4 py-2 text-sm font-medium ${variantClass} ${props.fullWidth ? 'w-full' : ''}`}>
      {props.label}
    </button>
  );
}
