import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "indigo" | "green" | "orange" | "blue" | "rose";
  className?: string;
  description?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "indigo",
  className,
  description,
}: MetricCardProps) {
  const colorStyles = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      ring: "group-hover:ring-indigo-100",
    },
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      ring: "group-hover:ring-emerald-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
      ring: "group-hover:ring-orange-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      ring: "group-hover:ring-blue-100",
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      ring: "group-hover:ring-rose-100",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded-full",
                  trend.isPositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700",
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-400 font-medium">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 transition-colors duration-300",
            styles.bg,
          )}
        >
          <Icon className={cn("h-6 w-6", styles.text)} />
        </div>
      </div>

      {/* Decorative gradient blur at bottom */}
      <div
        className={cn(
          "absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20",
          styles.bg.replace("bg-", "bg-"), // Logic to reuse color
        )}
        style={{ backgroundColor: `var(--${color}-500)` }} // Fallback to inline if needed or rely on variable
      />
    </div>
  );
}
