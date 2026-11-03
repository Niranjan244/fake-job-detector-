export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-3.5 h-3.5 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-[2.5px]',
    xl: 'w-8 h-8 border-3',
  };

  return (
    <div
      className={`animate-spin rounded-full border-current border-t-transparent ${
        sizes[size] || sizes.md
      } ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
