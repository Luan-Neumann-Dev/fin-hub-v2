"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createExpense, type ExpenseFormState } from "@/app/actions/transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/api/types";

const initialState: ExpenseFormState = {};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

export function ExpenseDialog({
  categories,
  defaultDate,
  disabled = false,
}: {
  categories: Category[];
  defaultDate: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"fixed" | "variable" | "installment">(
    "variable",
  );
  const [state, formAction, pending] = useActionState(createExpense, initialState);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} disabled={disabled}>
        <Plus className="h-4 w-4" />
        Nova despesa
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Nova despesa
                </h2>
                <p className="text-sm text-muted-foreground">
                  Registre um gasto fixo, variavel ou parcelado.
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
                  htmlFor="expense-description"
                  className="text-sm font-medium text-foreground"
                >
                  Descricao
                </label>
                <Input
                  id="expense-description"
                  name="description"
                  placeholder="Mercado"
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
                    htmlFor="expense-amount"
                    className="text-sm font-medium text-foreground"
                  >
                    Valor
                  </label>
                  <Input
                    id="expense-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150.75"
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
                    htmlFor="expense-date"
                    className="text-sm font-medium text-foreground"
                  >
                    Data
                  </label>
                  <Input
                    id="expense-date"
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
                  htmlFor="expense-category"
                  className="text-sm font-medium text-foreground"
                >
                  Categoria
                </label>
                <select
                  id="expense-category"
                  name="categoryId"
                  defaultValue={categories[0]?.id ?? ""}
                  className={selectClassName}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-type"
                    className="text-sm font-medium text-foreground"
                  >
                    Tipo
                  </label>
                  <select
                    id="expense-type"
                    name="type"
                    value={type}
                    onChange={(event) => setType(event.target.value as typeof type)}
                    className={selectClassName}
                  >
                    <option value="variable">Variavel</option>
                    <option value="fixed">Fixa</option>
                    <option value="installment">Parcelada</option>
                  </select>
                  {state.errors?.type && (
                    <p className="text-xs text-destructive">
                      {state.errors.type[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-status"
                    className="text-sm font-medium text-foreground"
                  >
                    Status
                  </label>
                  <select
                    id="expense-status"
                    name="status"
                    defaultValue="pending"
                    disabled={type === "installment"}
                    className={selectClassName}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                  </select>
                  {type === "installment" && (
                    <p className="text-xs text-muted-foreground">
                      Parcelas entram como pendentes.
                    </p>
                  )}
                </div>
              </div>

              {type === "installment" && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="expense-installments"
                    className="text-sm font-medium text-foreground"
                  >
                    Parcelas
                  </label>
                  <Input
                    id="expense-installments"
                    name="totalInstallments"
                    type="number"
                    min="2"
                    max="120"
                    defaultValue="2"
                    required
                  />
                  {state.errors?.totalInstallments && (
                    <p className="text-xs text-destructive">
                      {state.errors.totalInstallments[0]}
                    </p>
                  )}
                </div>
              )}

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
