import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FinanceCard } from "@/components/finance/finance-card";
import {
  getDashboardAlerts,
  getDashboardCategories,
  getDashboardSummary,
  getMonthIncomes,
  getRecentTransactions,
} from "@/lib/api/dashboard";
import type {
  DashboardAlerts,
  DashboardCategory,
  DashboardSummary,
  Income,
  Transaction,
} from "@/lib/api/types";
import { formatCurrency, getCurrentMonthYear } from "@/lib/format";

type SearchParams = Promise<{
  month?: string | string[];
  year?: string | string[];
}>;

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const emptySummary: DashboardSummary = {
  totalIncomes: 0,
  totalExpenses: 0,
  balance: 0,
  totalPaidExpenses: 0,
  totalPendingExpenses: 0,
  piggyBanksBalance: 0,
  investedAmount: 0,
  investmentsCurrentAmount: 0,
  investmentsProfit: 0,
  openInvoicesAmount: 0,
};

const emptyAlerts: DashboardAlerts = {
  overdueInvoices: [],
  dueSoonInvoices: [],
};

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

function addMonth(month: number, year: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);

  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

function settledValue<T>(result: PromiseSettledResult<T>, fallback: T) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function monthHref(input: { month: number; year: number }) {
  return `/?month=${input.month}&year=${input.year}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { month, year } = normalizeMonthYear(await searchParams);
  const previous = addMonth(month, year, -1);
  const next = addMonth(month, year, 1);

  const results = await Promise.allSettled([
    getDashboardSummary({ month, year }),
    getDashboardCategories({ month, year }),
    getDashboardAlerts(),
    getRecentTransactions({ month, year }),
    getMonthIncomes({ month, year }),
  ]);

  const summary = settledValue(results[0], emptySummary);
  const categories = settledValue<DashboardCategory[]>(results[1], []);
  const alerts = settledValue(results[2], emptyAlerts);
  const transactions = settledValue<Transaction[]>(results[3], []);
  const incomes = settledValue<Income[]>(results[4], []);
  const hasApiIssue = results.some((result) => result.status === "rejected");
  const totalAlerts = alerts.overdueInvoices.length + alerts.dueSoonInvoices.length;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visao geral das suas financas pessoais.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card p-1 shadow-sm">
          <Link
            href={monthHref(previous)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-40 text-center text-sm font-semibold text-foreground">
            {monthNames[month - 1]} {year}
          </span>
          <Link
            href={monthHref(next)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Proximo mes"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar todos os dados da API agora. Mantive a tela
            de pe com valores vazios para a base continuar navegavel.
          </p>
        </div>
      )}

      {totalAlerts > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
          Existem {totalAlerts} alerta(s) de fatura para revisar.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceCard
          title="Saldo Atual"
          value={formatCurrency(summary.balance)}
          icon={Wallet}
          variant="highlight"
          subtitle="Receitas menos despesas"
        />
        <FinanceCard
          title="Receitas"
          value={formatCurrency(summary.totalIncomes)}
          icon={TrendingUp}
          variant="income"
          subtitle={`${incomes.length} entrada(s) no mes`}
        />
        <FinanceCard
          title="Despesas"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          variant="expense"
          subtitle={`${formatCurrency(summary.totalPaidExpenses)} pagos`}
        />
        <FinanceCard
          title="Patrimonio"
          value={formatCurrency(
            summary.piggyBanksBalance + summary.investmentsCurrentAmount,
          )}
          icon={Target}
          subtitle="Cofrinhos + investimentos"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="finance-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              Gastos por Categoria
            </h2>
            <Badge>{categories.length} categorias</Badge>
          </div>
          <div className="space-y-3">
            {categories.length > 0 ? (
              categories.map((category) => {
                const total = Math.max(summary.totalExpenses, 1);
                const width = Math.round((Number(category.totalAmount) / total) * 100);

                return (
                  <div key={category.categoryId ?? category.categoryName}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-muted-foreground">
                        {category.categoryName}
                      </span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(category.totalAmount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(width, 100)}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma despesa por categoria neste periodo.
              </p>
            )}
          </div>
        </div>

        <div className="finance-card lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Ultimas Transacoes</h2>
            <Badge variant="pending">
              {summary.totalPendingExpenses
                ? `${formatCurrency(summary.totalPendingExpenses)} pendente`
                : "Sem pendencias"}
            </Badge>
          </div>

          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                    style={{
                      backgroundColor: `${transaction.category?.color ?? "#f97316"}18`,
                      color: transaction.category?.color ?? "#f97316",
                    }}
                  >
                    {(transaction.category?.name ?? "S").charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.category?.name ?? "Sem categoria"}
                    </p>
                  </div>
                  <Badge variant={transaction.status}>
                    {transaction.status === "paid" ? "Pago" : "Pendente"}
                  </Badge>
                  <p className="whitespace-nowrap text-sm font-semibold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Nenhuma transacao neste periodo.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
