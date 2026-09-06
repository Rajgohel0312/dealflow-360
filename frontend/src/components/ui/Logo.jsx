import { Zap } from "lucide-react";

export function LogoIcon({ size = "md" }) {
  const dim =
    size === "sm"
      ? "w-8 h-8 rounded-lg"
      : size === "lg"
      ? "w-12 h-12 rounded-2xl"
      : "w-10 h-10 rounded-xl";

  const iconDim =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-indigo-600 via-primary-700 to-indigo-900 text-white font-extrabold shadow-md shadow-indigo-600/30 border border-indigo-400/30 ${dim}`}
    >
      <Zap className={`${iconDim} text-amber-300 fill-amber-300 animate-pulse`} />
    </div>
  );
}

export default function Logo({
  size = "md",
  subtitle = null,
  showBadge = true,
  className = "",
}) {
  const titleSize =
    size === "sm"
      ? "text-base"
      : size === "lg"
      ? "text-2xl"
      : "text-lg";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoIcon size={size} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-text-primary ${titleSize}`}>
            Deal <span className="text-primary-600">Flow</span>
          </span>
          {showBadge && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px] font-extrabold border border-indigo-200 uppercase tracking-wide">
              360
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-xs font-semibold text-text-muted leading-none mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
