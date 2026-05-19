"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  createIncome,
  type IncomeFormState,
} from "@/app/actions/incomes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: IncomeFormState = {};

export function IncomeDialog({
  defaultDate,
  disabled = false,
}: {
  defaultDate: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createIncome, initialState);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="h-4 w-4" />
        Nova receita
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Nova receita
                </h2>
                <p className="text-sm text-muted-foreground">
                  Registre uma nova entrada financeira.
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
                  htmlFor="income-name"
                  className="text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <Input
                  id="income-name"
                  name="name"
                  placeholder="Salario"
                  maxLength={120}
                  required
                />
                {state.errors?.name && (
                  <p className="text-xs text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="income-amount"
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <Input
                    id="income-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5000.00"
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
                    htmlFor="income-date"
                    className="text-sm font-medium text-foreground"
                  >
                    Data
                  </label>
                <Input
                  id="income-date"
                  name="date"
                  type="date"
                  defaultValue={defaultDate}
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
                  htmlFor="income-type"
                  className="text-sm font-medium text-foreground"
                >
                  Tipo
                </label>
                <select
                  id="income-type"
                  name="type"
                  defaultValue="fixed"
                  className="flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                >
                  <option value="fixed">Fixa</option>
                  <option value="variable">Variavel</option>
                </select>
                {state.errors?.type && (
                  <p className="text-xs text-destructive">
                    {state.errors.type[0]}
                  </p>
                )}
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
