"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createInvoice, type InvoiceFormState } from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreditCard } from "@/lib/api/types";

const initialState: InvoiceFormState = {};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

export function InvoiceDialog({
  cards,
  disabled = false,
}: {
  cards: CreditCard[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createInvoice, initialState);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="h-4 w-4" />
        Nova fatura
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Nova fatura
                </h2>
                <p className="text-sm text-muted-foreground">
                  Abra uma fatura para lancar compras do cartao.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="invoice-card"
                  className="text-sm font-medium text-foreground"
                >
                  Cartao
                </label>
                <select
                  id="invoice-card"
                  name="creditCardId"
                  defaultValue={cards[0]?.id ?? ""}
                  className={selectClassName}
                  required
                >
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
                {state.errors?.creditCardId && (
                  <p className="text-xs text-destructive">
                    {state.errors.creditCardId[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="invoice-due"
                    className="text-sm font-medium text-foreground"
                  >
                    Vencimento
                  </label>
                  <Input
                    id="invoice-due"
                    name="dueDate"
                    type="date"
                    className="date-input"
                    required
                  />
                  {state.errors?.dueDate && (
                    <p className="text-xs text-destructive">
                      {state.errors.dueDate[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="invoice-closing"
                    className="text-sm font-medium text-foreground"
                  >
                    Fechamento
                  </label>
                  <Input
                    id="invoice-closing"
                    name="closingDate"
                    type="date"
                    className="date-input"
                  />
                  {state.errors?.closingDate && (
                    <p className="text-xs text-destructive">
                      {state.errors.closingDate[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="invoice-status"
                  className="text-sm font-medium text-foreground"
                >
                  Status
                </label>
                <select
                  id="invoice-status"
                  name="status"
                  defaultValue="open"
                  className={selectClassName}
                >
                  <option value="open">Aberta</option>
                  <option value="closed">Fechada</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>

              {state.message && !state.ok && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {state.message}
                </div>
              )}

              {state.ok && state.message && (
                <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
                  {state.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
