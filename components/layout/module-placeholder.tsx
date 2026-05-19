import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actionLabel?: string;
};

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  actionLabel,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {actionLabel && <Button type="button">{actionLabel}</Button>}
      </header>

      <section className="finance-card flex min-h-80 flex-col items-center justify-center text-center">
        <div className="finance-gradient mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Base do modulo pronta
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Esta rota ja esta protegida por sessao e pronta para receber os
          services, Server Actions e componentes especificos da API.
        </p>
      </section>
    </div>
  );
}
