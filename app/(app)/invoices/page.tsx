import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  FileText,
  Lock,
  ReceiptText,
  Trash2,
} from "lucide-react";
import {
  deleteCreditCard,
  deleteInvoice,
  deleteInvoicePurchase,
  updateInvoiceStatus,
} from "@/app/actions/invoices";
import { CreditCardDialog } from "@/components/finance/credit-card-dialog";
import { InvoiceDialog } from "@/components/finance/invoice-dialog";
import { InvoicePurchaseDialog } from "@/components/finance/invoice-purchase-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCreditCards } from "@/lib/api/credit-cards";
import { getInvoice, getInvoices } from "@/lib/api/invoices";
import type { CreditCard as CreditCardType, Invoice } from "@/lib/api/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type InvoiceFilter = "all" | "open" | "closed" | "overdue";

type SearchParams = Promise<{
  card?: string | string[];
  status?: string | string[];
  invoice?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeParams(params: Awaited<SearchParams>) {
  const status = getSingleParam(params.status);

  return {
    creditCardId: getSingleParam(params.card),
    invoiceId: getSingleParam(params.invoice),
    status:
      status === "open" || status === "closed" || status === "overdue"
        ? status
        : ("all" as InvoiceFilter),
  };
}

function invoicesHref({
  creditCardId,
  status,
  invoiceId,
}: {
  creditCardId?: string;
  status?: InvoiceFilter;
  invoiceId?: string;
}) {
  const params = new URLSearchParams();

  if (creditCardId) params.set("card", creditCardId);
  if (status && status !== "all") params.set("status", status);
  if (invoiceId) params.set("invoice", invoiceId);

  const query = params.toString();

  return query ? `/invoices?${query}` : "/invoices";
}

function sortInvoices(invoices: Invoice[]) {
  return [...invoices].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function cardForInvoice(invoice: Invoice, cards: CreditCardType[]) {
  return (
    invoice.creditCard ??
    cards.find((card) => card.id === invoice.creditCardId) ??
    null
  );
}

function statusLabel(status: Invoice["status"]) {
  const labels = {
    open: "Aberta",
    closed: "Fechada",
    overdue: "Vencida",
  };

  return labels[status];
}

function invoicePeriod(invoice: Invoice) {
  if (!invoice.closingDate) return `Vence ${formatDate(invoice.dueDate)}`;

  return `Fecha ${formatDate(invoice.closingDate)} - vence ${formatDate(
    invoice.dueDate,
  )}`;
}

function cardColor(card?: CreditCardType | null) {
  return card?.color || "#7c3aed";
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { creditCardId, invoiceId, status } = normalizeParams(await searchParams);
  const [cardsResult, invoicesResult] = await Promise.allSettled([
    getCreditCards(),
    getInvoices({
      creditCardId,
      status: status === "all" ? undefined : status,
    }),
  ]);
  const hasApiIssue =
    cardsResult.status === "rejected" || invoicesResult.status === "rejected";
  const cards = cardsResult.status === "fulfilled" ? cardsResult.value : [];
  const invoices =
    invoicesResult.status === "fulfilled" ? sortInvoices(invoicesResult.value) : [];
  const selectedId = invoiceId ?? invoices[0]?.id;
  const selectedResult = selectedId
    ? await Promise.allSettled([getInvoice(selectedId)])
    : null;
  const selectedInvoice =
    selectedResult?.[0].status === "fulfilled" ? selectedResult[0].value : null;
  const selectedCard = selectedInvoice
    ? cardForInvoice(selectedInvoice, cards)
    : null;
  const purchases = [...(selectedInvoice?.purchases ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const openAmount = invoices
    .filter((invoice) => invoice.status === "open")
    .reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
  const overdueAmount = invoices
    .filter((invoice) => invoice.status === "overdue")
    .reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.totalAmount),
    0,
  );
  const canCreateInvoice = cards.length > 0;
  const isClosed = selectedInvoice?.status === "closed";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Faturas
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe cartoes, vencimentos e compras do credito.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CreditCardDialog />
          <InvoiceDialog cards={cards} disabled={!canCreateInvoice} />
        </div>
      </header>

      {hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4 text-warning">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Nao consegui carregar todos os dados de faturas da API agora.
          </p>
        </div>
      )}

      {!canCreateInvoice && !hasApiIssue && (
        <div className="flex items-center gap-3 rounded-xl border border-info/25 bg-info/5 p-4 text-info">
          <CreditCard className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Cadastre um cartao antes de abrir a primeira fatura.
          </p>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Aberto
          </span>
          <span className="font-semibold text-info">
            {formatCurrency(openAmount)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Vencido
          </span>
          <span className="font-semibold text-destructive">
            {formatCurrency(overdueAmount)}
          </span>
        </div>

        <div className="finance-card-compact flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total filtrado
          </span>
          <span className="font-semibold text-foreground">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cartoes
            </span>
            <Link
              href={invoicesHref({ status })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                !creditCardId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              Todos
            </Link>
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-1">
                <Link
                  href={invoicesHref({ creditCardId: card.id, status })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    creditCardId === card.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {card.name}
                </Link>
                <form action={deleteCreditCard}>
                  <input type="hidden" name="id" value={card.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir cartao ${card.name}`}
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            {(["all", "open", "closed", "overdue"] as InvoiceFilter[]).map(
              (filter) => (
                <Link
                  key={filter}
                  href={invoicesHref({ creditCardId, status: filter })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    status === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {filter === "all" ? "Todas" : statusLabel(filter)}
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[390px_1fr]">
        <div className="space-y-3">
          {invoices.length > 0 ? (
            invoices.map((invoice) => {
              const card = cardForInvoice(invoice, cards);
              const color = cardColor(card);
              const active = selectedId === invoice.id;

              return (
                <Link
                  key={invoice.id}
                  href={invoicesHref({
                    creditCardId,
                    status,
                    invoiceId: invoice.id,
                  })}
                  className={cn(
                    "finance-card-compact block transition-colors",
                    active && "border-primary/40 bg-primary/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${color}18`,
                        color,
                      }}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {card?.name ?? "Cartao"}
                        </p>
                        <Badge variant={invoice.status}>
                          {statusLabel(invoice.status)}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {invoicePeriod(invoice)}
                      </p>
                      <p className="mt-3 text-lg font-bold text-foreground">
                        {formatCurrency(invoice.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="finance-card flex min-h-64 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Nenhuma fatura encontrada
              </h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Crie uma fatura ou altere os filtros para revisar outros
                vencimentos.
              </p>
            </div>
          )}
        </div>

        <div className="finance-card min-h-[520px]">
          {selectedInvoice ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `${cardColor(selectedCard)}18`,
                      color: cardColor(selectedCard),
                    }}
                  >
                    <CreditCard className="h-7 w-7" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">
                        {selectedCard?.name ?? "Fatura"}
                      </h2>
                      <Badge variant={selectedInvoice.status}>
                        {statusLabel(selectedInvoice.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invoicePeriod(selectedInvoice)}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-foreground">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <InvoicePurchaseDialog
                    invoiceId={selectedInvoice.id}
                    disabled={isClosed}
                  />
                  <form action={updateInvoiceStatus}>
                    <input type="hidden" name="id" value={selectedInvoice.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={isClosed ? "open" : "closed"}
                    />
                    <Button type="submit" variant="secondary">
                      {isClosed ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      {isClosed ? "Reabrir" : "Fechar"}
                    </Button>
                  </form>
                  <form action={deleteInvoice}>
                    <input type="hidden" name="id" value={selectedInvoice.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label="Excluir fatura"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>

              {isClosed && (
                <div className="flex items-center gap-3 rounded-xl border border-muted bg-muted/50 p-4 text-muted-foreground">
                  <Lock className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Esta fatura esta fechada. Reabra para adicionar ou remover
                    compras.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Vencimento
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ReceiptText className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Compras
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {purchases.length} lancamento
                    {purchases.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Compras da fatura
                  </h3>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>

                {purchases.length > 0 ? (
                  purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center gap-4 rounded-xl border bg-card p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ReceiptText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {purchase.description}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(purchase.date)}
                          </span>
                          {purchase.category && (
                            <span className="text-xs font-medium text-primary">
                              {purchase.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-nowrap text-sm font-semibold tabular-nums text-foreground">
                        {formatCurrency(purchase.amount)}
                      </p>
                      {isClosed ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Fatura fechada"
                          className="text-muted-foreground"
                          disabled
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      ) : (
                        <form action={deleteInvoicePurchase}>
                          <input
                            type="hidden"
                            name="invoiceId"
                            value={selectedInvoice.id}
                          />
                          <input
                            type="hidden"
                            name="purchaseId"
                            value={purchase.id}
                          />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            aria-label={`Excluir ${purchase.description}`}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed text-center">
                    <ReceiptText className="mb-3 h-8 w-8 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Nenhuma compra nesta fatura
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Adicione compras para acompanhar o total da fatura em tempo
                      real.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                Selecione uma fatura
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Escolha uma fatura na lista para ver compras, vencimento e acoes.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
