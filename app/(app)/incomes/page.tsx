import { AlertTriangle, Lock, Trash2, Wallet } from "lucide-react";
import { deleteIncome } from "@/app/actions/incomes";
import { IncomeDialog } from "@/components/finance/income-dialog";
import { MonthClosingButton } from "@/components/finance/month-closing-button";
import { MonthSelector } from "@/components/finance/month-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIncomes } from "@/lib/api/incomes";
import type { Income } from "@/lib/api/types";
import { formatCurrency, formatDate, getCurrentMonthYear } from "@/lib/format";
import { isMonthClosed } from "@/lib/month-closing";

type SearchParams = Promise<{
  month?: string | string[];
  year?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeMonthYear(params: Awaited<SearchParams>) {
  const current = getCurrentMonthYear();
  const month = Number(getSingleParam(params.month) ?? current.month);
  const year = Number(getSingleParam(params.year) ?? current.year);

  return {
    month: month >= 1 && month <= 12 ? month : current.month,
    year: year >= 2000 && year <= 2100 ? year : current.year,
  };
}

function defaultIncomeDate(month: number, year: number) {
  const current = getCurrentMonthYear();
  const day =
    month === current.month && year === current.year
      ? new Date().getDate()
      : 1;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function typeLabel(type: Income["type"]) {
  return type === "fixed" ? "Fixa" : "Variavel";
}

function sortByDateDesc(incomes: Income[]) {
  return [...incomes].sort((a, b) => b.date.localeCompare(a.date));
}

export default async function IncomesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { month, year } = normalizeMonthYear(await searchParams);
  const [result, isClosed] = await Promise.all([
    Promise.allSettled([getIncomes({ month, year })]),
    isMonthClosed(month, year),
  ]);
  const hasApiIssue = result[0].status === "rejected";
  const incomes = result[0].status === "fulfilled" ? result[0].value : [];
  const total = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const fixedTotal = incomes
    .filter((income) => income.type === "fixed")
    .reduce((sum, income) => sum + Number(income.amount), 0);
  const variableTotal = total - fixedTotal;
  const sortedIncomes = sortByDateDesc(incomes);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Receitas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie suas fontes de renda mensais.
          </p>
        </div>
        <IncomeDialog
          defaultDate={defaultIncomeDate(month, year)}
          disabled={isClosed}
        />
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <MonthSelector month={month} year={year} pathname="/incomes" />
        <MonthClosingButton
          month={month}
          year={year}
          pathname="/incomes"
          isClosed={isClosed}
        />
      </div>

      {isClosed && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          <Lock className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Este mes esta fechado. Novas receitas e exclusoes ficam bloqueadas
            ate reabrir o periodo.
          </p>
        </div>
      )}

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar as receitas da API agora.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="finance-card-compact flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-success/10 p-2.5">
              <Wallet className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total do mes
              </p>
              <p className="text-xs text-muted-foreground">
                {incomes.length} entrada(s)
              </p>
            </div>
          </div>
          <p className="text-xl font-bold text-success">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Receitas fixas
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(fixedTotal)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Receitas variaveis
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(variableTotal)}
          </span>
        </div>
      </section>

      <section className="space-y-2">
        {sortedIncomes.length > 0 ? (
          sortedIncomes.map((income) => (
            <div
              key={income.id}
              className="finance-card-compact flex items-center gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10">
                <Wallet className="h-5 w-5 text-success" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {income.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(income.date)}
                </p>
              </div>

              <Badge variant={income.type}>{typeLabel(income.type)}</Badge>

              <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-success">
                + {formatCurrency(income.amount)}
              </p>

              {isClosed ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Mes fechado"
                  className="text-muted-foreground"
                  disabled
                >
                  <Lock className="h-4 w-4" />
                </Button>
              ) : (
                <form action={deleteIncome}>
                  <input type="hidden" name="id" value={income.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${income.name}`}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          ))
        ) : (
          <div className="finance-card flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <Wallet className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Nenhuma receita neste mes
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Cadastre sua primeira entrada para acompanhar o saldo do periodo.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
