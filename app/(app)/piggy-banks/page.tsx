import { AlertTriangle, Target, Trash2, Wallet } from "lucide-react";
import { deletePiggyBank } from "@/app/actions/piggy-banks";
import { PiggyBankDialog, PiggyIcon } from "@/components/finance/piggy-bank-dialog";
import { PiggyBankMovementDialog } from "@/components/finance/piggy-bank-movement-dialog";
import { ProgressBar } from "@/components/finance/progress-bar";
import { Button } from "@/components/ui/button";
import { getPiggyBanks } from "@/lib/api/piggy-banks";
import type { PiggyBank } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

function amount(value: string | number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function percentage(piggyBank: PiggyBank) {
  const target = amount(piggyBank.targetAmount);
  const current = amount(piggyBank.currentAmount);

  return target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
}

export default async function PiggyBanksPage() {
  const result = await Promise.allSettled([getPiggyBanks()]);
  const hasApiIssue = result[0].status === "rejected";
  const piggyBanks = result[0].status === "fulfilled" ? result[0].value : [];
  const totalSaved = piggyBanks.reduce(
    (sum, piggyBank) => sum + amount(piggyBank.currentAmount),
    0,
  );
  const totalTarget = piggyBanks.reduce(
    (sum, piggyBank) => sum + amount(piggyBank.targetAmount),
    0,
  );
  const completed = piggyBanks.filter(
    (piggyBank) => amount(piggyBank.currentAmount) >= amount(piggyBank.targetAmount),
  ).length;
  const globalPercentage =
    totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Cofrinhos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Organize metas e reservas financeiras.
          </p>
        </div>
        <PiggyBankDialog />
      </header>

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar os cofrinhos da API agora.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="finance-card-compact">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-success/10 p-2.5">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total guardado
                </p>
                <p className="text-xs text-muted-foreground">
                  {piggyBanks.length} cofrinho(s)
                </p>
              </div>
            </div>
            <p className="text-xl font-bold text-success">
              {formatCurrency(totalSaved)}
            </p>
          </div>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Meta total
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(totalTarget)}
          </span>
        </div>

        <div className="finance-card-compact">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Progresso geral
            </span>
            <span className="font-semibold text-foreground">
              {globalPercentage}%
            </span>
          </div>
          <ProgressBar value={totalSaved} max={totalTarget} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {piggyBanks.length > 0 ? (
          piggyBanks.map((piggyBank) => {
            const current = amount(piggyBank.currentAmount);
            const target = amount(piggyBank.targetAmount);
            const done = current >= target;
            const pct = percentage(piggyBank);

            return (
              <article key={piggyBank.id} className="finance-card">
                <div className="mb-5 flex items-start gap-3">
                  <PiggyIcon icon={piggyBank.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate font-semibold text-foreground">
                        {piggyBank.name}
                      </h2>
                      {done && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                          Completo
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Meta: {formatCurrency(target)}
                    </p>
                  </div>

                  <form action={deletePiggyBank}>
                    <input type="hidden" name="id" value={piggyBank.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${piggyBank.name}`}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={cn(
                        "font-semibold",
                        done ? "text-success" : "text-muted-foreground",
                      )}
                    >
                      {pct}%
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(current)} / {formatCurrency(target)}
                    </span>
                  </div>
                  <ProgressBar value={current} max={target} />
                </div>

                <div className="mt-5 flex gap-2">
                  <PiggyBankMovementDialog
                    id={piggyBank.id}
                    name={piggyBank.name}
                    mode="deposit"
                  />
                  <PiggyBankMovementDialog
                    id={piggyBank.id}
                    name={piggyBank.name}
                    mode="withdraw"
                  />
                </div>
              </article>
            );
          })
        ) : (
          <div className="finance-card col-span-full flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Nenhum cofrinho criado ainda
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Crie uma meta para acompanhar o progresso da sua reserva,
              viagem, emergencia ou qualquer objetivo financeiro.
            </p>
          </div>
        )}
      </section>

      {completed > 0 && (
        <p className="text-sm text-muted-foreground">
          {completed} meta(s) ja chegaram ao valor planejado.
        </p>
      )}
    </div>
  );
}
