"use client";

import { useActionState, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  movePiggyBank,
  type PiggyBankMovementState,
} from "@/app/actions/piggy-banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: PiggyBankMovementState = {};

export function PiggyBankMovementDialog({
  id,
  name,
  mode,
}: {
  id: string;
  name: string;
  mode: "deposit" | "withdraw";
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    movePiggyBank,
    initialState,
  );
  const isDeposit = mode === "deposit";

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={isDeposit ? "default" : "secondary"}
        className="flex-1"
        onClick={() => setOpen(true)}
      >
        {isDeposit ? (
          <Plus className="h-3.5 w-3.5" />
        ) : (
          <Minus className="h-3.5 w-3.5" />
        )}
        {isDeposit ? "Depositar" : "Retirar"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {isDeposit ? "Depositar" : "Retirar"}
                </h2>
                <p className="text-sm text-muted-foreground">{name}</p>
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
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="mode" value={mode} />
              <div className="space-y-1.5">
                <label
                  htmlFor={`${mode}-${id}`}
                  className="text-sm font-medium text-foreground"
                >
                  Valor
                </label>
                <Input
                  id={`${mode}-${id}`}
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  required
                />
                {state.errors?.amount && (
                  <p className="text-xs text-destructive">
                    {state.errors.amount[0]}
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
                  {pending ? "Salvando..." : "Confirmar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
