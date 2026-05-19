"use client";

import { useActionState, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import {
  saveInvestment,
  type InvestmentFormState,
} from "@/app/actions/investments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Investment, InvestmentType } from "@/lib/api/types";

const initialState: InvestmentFormState = {};

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20";

const typeOptions: Array<{ value: InvestmentType; label: string }> = [
  { value: "fixed_income", label: "Renda fixa" },
  { value: "stock", label: "Acoes" },
  { value: "fund", label: "Fundos" },
  { value: "crypto", label: "Cripto" },
];

export function InvestmentDialog({
  investment,
}: {
  investment?: Investment;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveInvestment,
    initialState,
  );
  const isEditing = Boolean(investment);

  return (
    <>
      <Button
        type="button"
        variant={isEditing ? "ghost" : "default"}
        size={isEditing ? "icon" : "default"}
        onClick={() => setOpen(true)}
        aria-label={isEditing ? `Editar ${investment?.name}` : undefined}
      >
        {isEditing ? (
          <Pencil className="h-4 w-4" />
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Novo investimento
          </>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isEditing ? "Editar investimento" : "Novo investimento"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atualize patrimonio investido e valor atual.
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
              {investment && (
                <input type="hidden" name="id" value={investment.id} />
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor={`investment-name-${investment?.id ?? "new"}`}
                  className="text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <Input
                  id={`investment-name-${investment?.id ?? "new"}`}
                  name="name"
                  placeholder="Tesouro Selic"
                  defaultValue={investment?.name}
                  maxLength={100}
                  required
                />
                {state.errors?.name && (
                  <p className="text-xs text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`investment-type-${investment?.id ?? "new"}`}
                  className="text-sm font-medium text-foreground"
                >
                  Tipo
                </label>
                <select
                  id={`investment-type-${investment?.id ?? "new"}`}
                  name="type"
                  defaultValue={investment?.type ?? "fixed_income"}
                  className={selectClassName}
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {state.errors?.type && (
                  <p className="text-xs text-destructive">
                    {state.errors.type[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor={`investment-invested-${investment?.id ?? "new"}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Investido
                  </label>
                  <Input
                    id={`investment-invested-${investment?.id ?? "new"}`}
                    name="investedAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1000.00"
                    defaultValue={investment?.investedAmount}
                    required
                  />
                  {state.errors?.investedAmount && (
                    <p className="text-xs text-destructive">
                      {state.errors.investedAmount[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor={`investment-current-${investment?.id ?? "new"}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Valor atual
                  </label>
                  <Input
                    id={`investment-current-${investment?.id ?? "new"}`}
                    name="currentAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1250.00"
                    defaultValue={investment?.currentAmount}
                    required
                  />
                  {state.errors?.currentAmount && (
                    <p className="text-xs text-destructive">
                      {state.errors.currentAmount[0]}
                    </p>
                  )}
                </div>
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
