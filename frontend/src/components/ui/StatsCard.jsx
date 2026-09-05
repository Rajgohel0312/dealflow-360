export function StatsCard({ title, value, icon: Icon, description, trend, color = "primary" }) {
  const iconColors = {
    primary: "bg-primary-50 text-primary-600 border-primary-100",
    success: "bg-success-50 text-success-600 border-success-100",
    warning: "bg-warning-50 text-warning-600 border-warning-100",
    info: "bg-info-50 text-info-600 border-info-100",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-6 shadow-sm border border-border transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {title}
          </p>
          <h4 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">
            {value}
          </h4>
          {description && (
            <p className="mt-1 text-xs text-text-secondary">{description}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${iconColors[color] || iconColors.primary}`}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-medium text-success-700">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
