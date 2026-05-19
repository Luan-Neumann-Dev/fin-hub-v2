import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Filter,
  Lock,
  Receipt,
  Trash2,
} from "lucide-react";
import { deleteExpense, markExpenseAsPaid } from "@/app/actions/transactions";
import { ExpenseDialog } from "@/components/finance/expense-dialog";
import { MonthClosingButton } from "@/components/finance/month-closing-button";
import { MonthSelector } from "@/components/finance/month-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/api/categories";
import { getTransactions } from "@/lib/api/transactions";
import type { Category, Transaction } from "@/lib/api/types";
import { formatCurrency, formatDate, getCurrentMonthYear } from "@/lib/format";
import { isMonthClosed } from "@/lib/month-closing";
import { cn } from "@/lib/utils";

type ExpenseFilter = "all" | "pending" | "paid";

type SearchParams = Promise<{
  month?: string | string[];
  year?: string | string[];
  status?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeMonthYear(params: Awaited<SearchParams>) {
  const current = getCurrentMonthYear();
  const month = Number(getSingleParam(params.month) ?? current.month);
  const year = Number(getSingleParam(params.year) ?? current.year);
  const rawStatus = getSingleParam(params.status);

  return {
    month: month >= 1 && month <= 12 ? month : current.month,
    year: year >= 2000 && year <= 2100 ? year : current.year,
    status:
      rawStatus === "paid" || rawStatus === "pending"
        ? rawStatus
        : ("all" as ExpenseFilter),
  };
}

function defaultExpenseDate(month: number, year: number) {
  const current = getCurrentMonthYear();
  const day =
    month === current.month && year === current.year
      ? new Date().getDate()
      : 1;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateKey(value: string) {
  return value.slice(0, 10);
}

function statusLabel(status: Transaction["status"]) {
  return status === "paid" ? "Pago" : "Pendente";
}

function typeLabel(type: Transaction["type"]) {
  const labels = {
    fixed: "Fixa",
    variable: "Variavel",
    installment: "Parcelada",
  };

  return labels[type];
}

function filterHref(month: number, year: number, status: ExpenseFilter) {
  const params = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  if (status !== "all") params.set("status", status);

  return `/expenses?${params.toString()}`;
}

function groupByDate(transactions: Transaction[]) {
  return transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
    const key = dateKey(transaction.date);
    acc[key] ??= [];
    acc[key].push(transaction);

    return acc;
  }, {});
}

function sortByDateDesc(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

function categoryName(transaction: Transaction) {
  return transaction.category?.name ?? "Sem categoria";
}

function categoryColor(transaction: Transaction) {
  return transaction.category?.color ?? "#64748b";
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { month, year, status } = normalizeMonthYear(await searchParams);
  const [transactionsResult, categoriesResult, isClosed] = await Promise.all([
    Promise.allSettled([getTransactions({ month, year })]),
    Promise.allSettled([getCategories()]),
    isMonthClosed(month, year),
  ]);
  const hasApiIssue =
    transactionsResult[0].status === "rejected" ||
    categoriesResult[0].status === "rejected";
  const transactions =
    transactionsResult[0].status === "fulfilled" ? transactionsResult[0].value : [];
  const categories: Category[] =
    categoriesResult[0].status === "fulfilled" ? categoriesResult[0].value : [];
  const filteredTransactions =
    status === "all"
      ? transactions
      : transactions.filter((transaction) => transaction.status === status);
  const sortedTransactions = sortByDateDesc(filteredTransactions);
  const grouped = groupByDate(sortedTransactions);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
  const totalPending = transactions
    .filter((transaction) => transaction.status === "pending")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalPaid = transactions
    .filter((transaction) => transaction.status === "paid")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const total = totalPending + totalPaid;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Despesas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Controle gastos fixos, variaveis e parcelados.
          </p>
        </div>
        <ExpenseDialog
          categories={categories}
          defaultDate={defaultExpenseDate(month, year)}
          disabled={isClosed}
        />
      </header>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <MonthSelector month={month} year={year} pathname="/expenses" />
          <MonthClosingButton
            month={month}
            year={year}
            pathname="/expenses"
            isClosed={isClosed}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", "pending", "paid"] as ExpenseFilter[]).map((filter) => (
            <Link
              key={filter}
              href={filterHref(month, year, filter)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                status === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {filter === "all"
                ? "Todas"
                : filter === "pending"
                  ? "Pendentes"
                  : "Pagas"}
            </Link>
          ))}
        </div>
      </div>

      {isClosed && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
          <Lock className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Este mes esta fechado. Novas despesas, pagamentos e exclusoes ficam
            bloqueados ate reabrir o periodo.
          </p>
        </div>
      )}

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar todos os dados de despesas da API agora.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total do mes
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Pendente
          </span>
          <span className="font-semibold text-warning">
            {formatCurrency(totalPending)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Pago</span>
          <span className="font-semibold text-success">
            {formatCurrency(totalPaid)}
          </span>
        </div>
      </section>

      <section className="space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <div key={date} className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDate(date)}
              </p>

              {grouped[date].map((transaction) => {
                const isPaid = transaction.status === "paid";
                const color = categoryColor(transaction);

                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "finance-card-compact flex items-center gap-4 transition-opacity",
                      isPaid && "opacity-70",
                    )}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
                      style={{
                        backgroundColor: `${color}18`,
                        color,
                      }}
                    >
                      {categoryName(transaction).charAt(0)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm font-semibold",
                          isPaid
                            ? "text-muted-foreground line-through"
                            : "text-foreground",
                        )}
                      >
                        {transaction.description}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {categoryName(transaction)}
                        </span>
                        {transaction.installmentInfo && (
                          <span className="text-xs font-semibold text-primary">
                            ({transaction.installmentInfo})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hidden items-center gap-1.5 md:flex">
                      <Badge variant={transaction.type}>
                        {typeLabel(transaction.type)}
                      </Badge>
                      <Badge variant={transaction.status}>
                        {statusLabel(transaction.status)}
                      </Badge>
                    </div>

                    <p
                      className={cn(
                        "whitespace-nowrap text-sm font-semibold tabular-nums",
                        isPaid ? "text-muted-foreground" : "text-foreground",
                      )}
                    >
                      - {formatCurrency(transaction.amount)}
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
                      <div className="flex items-center gap-1">
                        {!isPaid && (
                          <form action={markExpenseAsPaid}>
                            <input type="hidden" name="id" value={transaction.id} />
                            <input type="hidden" name="month" value={month} />
                            <input type="hidden" name="year" value={year} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              aria-label={`Marcar ${transaction.description} como paga`}
                              className="text-success hover:bg-success/10 hover:text-success"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </form>
                        )}

                        <form action={deleteExpense}>
                          <input type="hidden" name="id" value={transaction.id} />
                          <input type="hidden" name="month" value={month} />
                          <input type="hidden" name="year" value={year} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${transaction.description}`}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="finance-card flex min-h-72 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Receipt className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Nenhuma despesa neste filtro
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Cadastre uma despesa ou altere o filtro para revisar outros
              lancamentos do periodo.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
