"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  createInvoicePurchase,
  type InvoicePurchaseFormState,
} from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: InvoicePurchaseFormState = {};

export function InvoicePurchaseDialog({
  invoiceId,
  disabled = false,
}: {
  invoiceId?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createInvoicePurchase,
    initialState,
  );

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        disabled={!invoiceId || disabled}
      >
        <Plus className="h-4 w-4" />
        Nova compra
      </Button>

      {open && invoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Nova compra
                </h2>
                <p className="text-sm text-muted-foreground">
                  Adicione um lancamento nesta fatura.
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
              <input type="hidden" name="invoiceId" value={invoiceId} />

              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-description"
                  className="text-sm font-medium text-foreground"
                >
                  Descricao
                </label>
                <Input
                  id="purchase-description"
                  name="description"
                  placeholder="Amazon"
                  maxLength={160}
                  required
                />
                {state.errors?.description && (
                  <p className="text-xs text-destructive">
                    {state.errors.description[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="purchase-amount"
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <Input
                    id="purchase-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="199.90"
                    required
                  />
                  {state.errors?.amount && (
                    <p className="text-xs text-destructive">
                      {state.errors.amount[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="purchase-date"
                    className="text-sm font-medium text-foreground"
                  >
                    Data
                  </label>
                  <Input
                    id="purchase-date"
                    name="date"
                    type="date"
                    className="date-input"
                    required
                  />
                  {state.errors?.date && (
                    <p className="text-xs text-destructive">
                      {state.errors.date[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="purchase-category"
                  className="text-sm font-medium text-foreground"
                >
                  Categoria
                </label>
                <Input
                  id="purchase-category"
                  name="category"
                  placeholder="Compras"
                  maxLength={80}
                />
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
