export default function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  required,
  rows = 3,
  ...props
}) {
  const inputId = id || props.name || undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 tracking-tight"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full rounded-xl border text-sm px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-red-300 text-red-900 focus:ring-red-400 focus:border-red-400'
            : 'border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500 hover:border-slate-400'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
