import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  default: {
    card: "border-border bg-card",
    icon: "bg-muted text-muted-foreground",
    title: "text-muted-foreground",
    value: "text-foreground",
    subtitle: "text-muted-foreground",
  },
  income: {
    card: "border-success/20 bg-card",
    icon: "bg-success/10 text-success",
    title: "text-muted-foreground",
    value: "text-success",
    subtitle: "text-muted-foreground",
  },
  expense: {
    card: "border-destructive/20 bg-card",
    icon: "bg-destructive/10 text-destructive",
    title: "text-muted-foreground",
    value: "text-destructive",
    subtitle: "text-muted-foreground",
  },
  highlight: {
    card: "finance-gradient border-transparent text-primary-foreground",
    icon: "bg-primary-foreground/20 text-primary-foreground",
    title: "text-primary-foreground/80",
    value: "text-primary-foreground",
    subtitle: "text-primary-foreground/70",
  },
};

type FinanceCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: keyof typeof variants;
  subtitle?: string;
  className?: string;
};

export function FinanceCard({
  title,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
  className,
}: FinanceCardProps) {
  const styles = variants[variant];

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md",
        styles.card,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className={cn("text-sm font-medium", styles.title)}>{title}</p>
          <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>
            {value}
          </p>
          {subtitle && (
            <p className={cn("text-xs", styles.subtitle)}>{subtitle}</p>
          )}
        </div>
        <div className={cn("shrink-0 rounded-xl p-2.5", styles.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
