export default function Select({
  label,
  error,
  helperText,
  children,
  className = '',
  id,
  required,
  ...props
}) {
  const selectId = id || props.name || undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          required={required}
          className={`w-full appearance-none rounded-xl border text-sm px-3.5 py-2.2 pr-10 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${
            error
              ? 'border-red-300 text-red-900 focus:ring-red-400'
              : 'border-slate-300 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
