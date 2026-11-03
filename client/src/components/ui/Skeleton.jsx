export default function Skeleton({
  className = '',
  width,
  height,
  rounded = 'rounded-xl',
}) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${rounded} ${className}`}
      style={{
        width: width || undefined,
        height: height || undefined,
      }}
    />
  );
}
