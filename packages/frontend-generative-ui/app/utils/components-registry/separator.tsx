export default function Separator({
  props
}: {
  props: {
    margin?: 'sm' | 'md' | 'lg';
  };
}) {
  const marginClass = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6'
  }[props.margin ?? 'md'];

  return <hr className={`w-full border-neutral-200 ${marginClass}`} />;
}
