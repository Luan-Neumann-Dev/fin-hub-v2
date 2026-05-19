import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Bitcoin,
  BriefcaseBusiness,
  LineChart,
  Landmark,
  Trash2,
} from "lucide-react";
import { deleteInvestment } from "@/app/actions/investments";
import { InvestmentDialog } from "@/components/finance/investment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInvestments } from "@/lib/api/investments";
import type { Investment, InvestmentType } from "@/lib/api/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type InvestmentFilter = "all" | InvestmentType;

type SearchParams = Promise<{
  type?: string | string[];
}>;

const typeLabels: Record<InvestmentType, string> = {
  fixed_income: "Renda fixa",
  stock: "Acoes",
  fund: "Fundos",
  crypto: "Cripto",
};

const typeStyles: Record<InvestmentType, string> = {
  fixed_income: "bg-info/10 text-info",
  stock: "bg-success/10 text-success",
  fund: "bg-primary/10 text-primary",
  crypto: "bg-warning/10 text-warning",
};

const typeIcons = {
  fixed_income: Landmark,
  stock: LineChart,
  fund: BriefcaseBusiness,
  crypto: Bitcoin,
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeType(value: string | string[] | undefined): InvestmentFilter {
  const type = getSingleParam(value);

  return type === "stock" ||
    type === "fixed_income" ||
    type === "crypto" ||
    type === "fund"
    ? type
    : "all";
}

function typeHref(type: InvestmentFilter) {
  return type === "all" ? "/investments" : `/investments?type=${type}`;
}

function sortInvestments(investments: Investment[]) {
  return [...investments].sort(
    (a, b) => Number(b.currentAmount) - Number(a.currentAmount),
  );
}

function profitClass(value: number) {
  if (value > 0) return "text-success";
  if (value < 0) return "text-destructive";

  return "text-muted-foreground";
}

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const type = normalizeType((await searchParams).type);
  const investmentsResult = await Promise.allSettled([
    getInvestments({ type: type === "all" ? undefined : type }),
  ]);
  const hasApiIssue = investmentsResult[0].status === "rejected";
  const investments =
    investmentsResult[0].status === "fulfilled"
      ? sortInvestments(investmentsResult[0].value)
      : [];
  const investedAmount = investments.reduce(
    (sum, investment) => sum + Number(investment.investedAmount),
    0,
  );
  const currentAmount = investments.reduce(
    (sum, investment) => sum + Number(investment.currentAmount),
    0,
  );
  const profit = currentAmount - investedAmount;
  const profitPercent = investedAmount > 0 ? (profit / investedAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Investimentos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe patrimonio, aporte e rendimento.
          </p>
        </div>
        <InvestmentDialog />
      </header>

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar os investimentos da API agora.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Investido
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(investedAmount)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Valor atual
          </span>
          <span className="font-semibold text-primary">
            {formatCurrency(currentAmount)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Resultado
          </span>
          <span className={cn("font-semibold", profitClass(profit))}>
            {formatCurrency(profit)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Rentabilidade
          </span>
          <span className={cn("font-semibold", profitClass(profit))}>
            {profitPercent.toFixed(2)}%
          </span>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tipo
        </span>
        {(["all", "fixed_income", "stock", "fund", "crypto"] as InvestmentFilter[]).map(
          (filter) => (
            <Link
              key={filter}
              href={typeHref(filter)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                type === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {filter === "all" ? "Todos" : typeLabels[filter]}
            </Link>
          ),
        )}
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {investments.length > 0 ? (
          investments.map((investment) => {
            const Icon = typeIcons[investment.type];
            const itemProfit = Number(investment.profit);
            const itemPercent = Number(investment.profitPercent);

            return (
              <div key={investment.id} className="finance-card space-y-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      typeStyles[investment.type],
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-foreground">
                        {investment.name}
                      </h2>
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          typeStyles[investment.type],
                        )}
                      >
                        {typeLabels[investment.type]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(investment.investedAmount)} investidos
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <InvestmentDialog investment={investment} />
                    <form action={deleteInvestment}>
                      <input type="hidden" name="id" value={investment.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        aria-label={`Excluir ${investment.name}`}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Atual</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(investment.currentAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Lucro</p>
                    <p className={cn("mt-1 text-sm font-semibold", profitClass(itemProfit))}>
                      {formatCurrency(itemProfit)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Percentual</p>
                    <p className={cn("mt-1 text-sm font-semibold", profitClass(itemProfit))}>
                      {itemPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="finance-card col-span-full flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Banknote className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Nenhum investimento encontrado
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Cadastre seus ativos para acompanhar patrimonio e rendimento.
            </p>
          </div>
        )}
      </section>

      {investments.length > 0 && (
        <section className="finance-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Composicao da carteira
            </h2>
            <Badge>{investments.length} ativo(s)</Badge>
          </div>
          <div className="space-y-3">
            {investments.map((investment) => {
              const width =
                currentAmount > 0
                  ? (Number(investment.currentAmount) / currentAmount) * 100
                  : 0;

              return (
                <div key={`composition-${investment.id}`}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted-foreground">
                      {investment.name}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(investment.currentAmount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full finance-gradient"
                      style={{ width: `${Math.min(width, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
