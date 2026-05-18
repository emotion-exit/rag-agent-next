export default function Text({
  props
}: {
  props: {
    text: string;
    variant?: 'body' | 'caption' | 'label';
    color?: 'default' | 'secondary' | 'muted';
  };
}) {
  const variantClass = {
    body: 'text-sm leading-6',
    caption: 'text-xs leading-5',
    label: 'text-sm font-medium'
  }[props.variant ?? 'body'];

  const colorClass = {
    default: 'text-neutral-900',
    secondary: 'text-neutral-700',
    muted: 'text-neutral-500'
  }[props.color ?? 'default'];

  return <p className={`${variantClass} ${colorClass}`}>{props.text}</p>;
}
