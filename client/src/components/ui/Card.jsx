export default function Card({
  children,
  className = '',
  hoverLift = false,
  padding = 'default',
  ...props
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6 sm:p-7',
    lg: 'p-8 sm:p-10',
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-soft transition-all duration-200 ${
        hoverLift ? 'hover:-translate-y-0.5 hover:shadow-soft-md' : ''
      } ${paddings[padding] || paddings.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
