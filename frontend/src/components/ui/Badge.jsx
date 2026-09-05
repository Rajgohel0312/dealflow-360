export function Badge({ variant = "default", children, className = "" }) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors";

  const variants = {
    default: "bg-neutral-100 text-neutral-800 border border-neutral-200",
    primary: "bg-primary-50 text-primary-700 border border-primary-200",
    success: "bg-success-50 text-success-700 border border-success-200",
    warning: "bg-warning-50 text-warning-700 border border-warning-200",
    danger: "bg-danger-50 text-danger-700 border border-danger-200",
    info: "bg-info-50 text-info-700 border border-info-200",
    gold: "bg-amber-50 text-amber-800 border border-amber-300 font-bold",
    silver: "bg-slate-100 text-slate-700 border border-slate-300 font-semibold",
    bronze: "bg-orange-50 text-orange-800 border border-orange-200 font-medium",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`${baseStyles} ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
}
