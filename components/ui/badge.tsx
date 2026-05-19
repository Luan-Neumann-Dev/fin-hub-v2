import { cn } from "@/lib/utils";

const styles = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  open: "bg-info/10 text-info",
  closed: "bg-muted text-muted-foreground",
  fixed: "bg-info/10 text-info",
  variable: "bg-accent text-accent-foreground",
  installment: "bg-primary/10 text-primary",
  neutral: "bg-muted text-muted-foreground",
};

type BadgeVariant = keyof typeof styles;

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
