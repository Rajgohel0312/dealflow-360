export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  className = "",
  disabled = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-text-primary">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:bg-neutral-100 disabled:cursor-not-allowed ${
          error ? "border-danger-500 focus:ring-danger-500/20" : "border-border"
        } ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger-600">{error}</p>}
    </div>
  );
}
