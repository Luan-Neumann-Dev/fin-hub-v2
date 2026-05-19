import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  LineChart,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MonthSelector } from "@/components/finance/month-selector";
import { Badge } from "@/components/ui/badge";
import {
  getCashflowReport,
  getCategoriesReport,
  getMonthlyEvolutionReport,
} from "@/lib/api/reports";
import type {
  CashflowReportItem,
  CategoryReportItem,
  MonthlyEvolutionReportItem,
} from "@/lib/api/types";
import { formatCurrency, getCurrentMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{
  months?: string | string[];
  month?: string | string[];
  year?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeParams(params: Awaited<SearchParams>) {
  const current = getCurrentMonthYear();
  const months = Number(getSingleParam(params.months) ?? 6);
  const month = Number(getSingleParam(params.month) ?? current.month);
  const year = Number(getSingleParam(params.year) ?? current.year);

  return {
    months: months >= 1 && months <= 60 ? months : 6,
    month: month >= 1 && month <= 12 ? month : current.month,
    year: year >= 2000 && year <= 2100 ? year : current.year,
  };
}

function monthsHref(months: number, month: number, year: number) {
  return `/reports?months=${months}&month=${month}&year=${year}`;
}

function numberValue(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

function shortLabel(label: string) {
  const [, month] = label.split("-");

  return month ?? label;
}

function total<T>(
  items: T[],
  selector: (item: T) => string | number | null | undefined,
) {
  return items.reduce((sum, item) => sum + numberValue(selector(item)), 0);
}

function maxValue(values: number[]) {
  return Math.max(...values.map((value) => Math.abs(value)), 1);
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function cashflowWidth(item: CashflowReportItem, max: number, key: "incomes" | "expenses") {
  return Math.min((numberValue(item[key]) / max) * 100, 100);
}

function evolutionWidth(item: MonthlyEvolutionReportItem, max: number) {
  return Math.min((numberValue(item.estimatedNetWorth) / max) * 100, 100);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { months, month, year } = normalizeParams(await searchParams);
  const results = await Promise.allSettled([
    getCashflowReport(months),
    getMonthlyEvolutionReport(months),
    getCategoriesReport({ month, year }),
  ]);
  const cashflow = settledValue<CashflowReportItem[]>(results[0], []);
  const evolution = settledValue<MonthlyEvolutionReportItem[]>(results[1], []);
  const categories = settledValue<CategoryReportItem[]>(results[2], []);
  const hasApiIssue = results.some((result) => result.status === "rejected");
  const totalIncomes = total(cashflow, (item) => item.incomes);
  const totalExpenses = total(cashflow, (item) => item.expenses);
  const totalBalance = total(cashflow, (item) => item.balance);
  const latestEvolution = evolution.at(-1);
  const cashflowMax = maxValue(
    cashflow.flatMap((item) => [numberValue(item.incomes), numberValue(item.expenses)]),
  );
  const netWorthMax = maxValue(
    evolution.map((item) => numberValue(item.estimatedNetWorth)),
  );
  const categoryTotal = total(categories, (item) => item.totalAmount);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Relatorios
          </h1>
          <p className="mt-1 text-muted-foreground">
            Analise fluxo de caixa, evolucao e categorias.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MonthSelector month={month} year={year} pathname="/reports" />
          <div className="flex items-center gap-2 rounded-xl border bg-card p-1 shadow-sm">
            {[3, 6, 12].map((option) => (
              <Link
                key={option}
                href={monthsHref(option, month, year)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  months === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {option}m
              </Link>
            ))}
          </div>
        </div>
      </header>

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar todos os relatorios da API agora.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="finance-card-compact flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-success" />
            Receitas
          </span>
          <span className="font-semibold text-success">
            {formatCurrency(totalIncomes)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Despesas
          </span>
          <span className="font-semibold text-destructive">
            {formatCurrency(totalExpenses)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4 text-primary" />
            Saldo
          </span>
          <span
            className={cn(
              "font-semibold",
              totalBalance >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {formatCurrency(totalBalance)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <LineChart className="h-4 w-4 text-info" />
            Patrimonio
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(latestEvolution?.estimatedNetWorth)}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="finance-card xl:col-span-3">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Fluxo de caixa</h2>
              <p className="text-sm text-muted-foreground">
                Receitas e despesas dos ultimos {months} meses.
              </p>
            </div>
            <Badge>{cashflow.length} meses</Badge>
          </div>

          <div className="space-y-4">
            {cashflow.length > 0 ? (
              cashflow.map((item) => {
                const balance = numberValue(item.balance);

                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          balance >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr_105px] items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        Receitas
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: `${cashflowWidth(item, cashflowMax, "incomes")}%` }}
                        />
                      </div>
                      <span className="text-right text-xs font-semibold text-foreground">
                        {formatCurrency(item.incomes)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr_105px] items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        Despesas
                      </span>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-destructive"
                          style={{ width: `${cashflowWidth(item, cashflowMax, "expenses")}%` }}
                        />
                      </div>
                      <span className="text-right text-xs font-semibold text-foreground">
                        {formatCurrency(item.expenses)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Nenhum dado de fluxo de caixa para exibir.
              </p>
            )}
          </div>
        </div>

        <div className="finance-card xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">
                Categorias do mes
              </h2>
              <p className="text-sm text-muted-foreground">
                Distribuicao das despesas por categoria.
              </p>
            </div>
            <PieChart className="h-5 w-5 text-primary" />
          </div>

          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((category) => {
                const percentage =
                  Number(category.percentage) ||
                  (categoryTotal > 0
                    ? (numberValue(category.totalAmount) / categoryTotal) * 100
                    : 0);

                return (
                  <div key={category.categoryId ?? category.categoryName}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">
                        {category.categoryName}
                      </span>
                      <span className="font-semibold text-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{category.totalTransactions} transacao(oes)</span>
                      <span>{formatCurrency(category.totalAmount)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Nenhuma categoria com despesa neste mes.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="finance-card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Evolucao mensal</h2>
            <p className="text-sm text-muted-foreground">
              Saldo acumulado, patrimonio estimado e investimentos.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {months} meses
          </div>
        </div>

        <div className="space-y-3">
          {evolution.length > 0 ? (
            evolution.map((item) => (
              <div
                key={`evolution-${item.label}`}
                className="grid grid-cols-[48px_1fr] items-center gap-3 sm:grid-cols-[70px_1fr_145px]"
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  {shortLabel(item.label)}
                </span>
                <div className="h-8 overflow-hidden rounded-lg bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-lg finance-gradient px-2 text-xs font-semibold text-primary-foreground"
                    style={{ width: `${evolutionWidth(item, netWorthMax)}%` }}
                  >
                    {formatCurrency(item.estimatedNetWorth)}
                  </div>
                </div>
                <span className="hidden text-right text-xs text-muted-foreground sm:block">
                  Inv. {formatCurrency(item.investmentsCurrentAmount)}
                </span>
              </div>
            ))
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <BarChart3 className="mb-3 h-9 w-9 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Nenhuma evolucao para exibir
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Conforme receitas, despesas e patrimonio forem registrados, a
                evolucao aparece aqui.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
