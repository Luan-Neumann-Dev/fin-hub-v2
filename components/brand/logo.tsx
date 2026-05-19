import { Wallet } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="finance-gradient flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
        <Wallet className="h-5 w-5 text-primary-foreground" />
      </div>
      <div>
        <p className="text-lg font-bold leading-tight text-foreground">
          Finance Hub
        </p>
        <p className="text-xs text-muted-foreground">Controle Financeiro</p>
      </div>
    </div>
  );
}
