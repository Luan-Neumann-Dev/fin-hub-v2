"use client";

import { useActionState, useState } from "react";
import { PiggyBank, Plus, X } from "lucide-react";
import {
  createPiggyBank,
  type PiggyBankFormState,
} from "@/app/actions/piggy-banks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: PiggyBankFormState = {};

export function PiggyBankDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createPiggyBank,
    initialState,
  );

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Nova meta
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Novo cofrinho
                </h2>
                <p className="text-sm text-muted-foreground">
                  Crie uma meta para acompanhar sua reserva.
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
              <div className="grid grid-cols-[90px_1fr] gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="piggy-icon"
                    className="text-sm font-medium text-foreground"
                  >
                    Icone
                  </label>
                  <Input
                    id="piggy-icon"
                    name="icon"
                    placeholder="piggy"
                    maxLength={40}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="piggy-name"
                    className="text-sm font-medium text-foreground"
                  >
                    Nome
                  </label>
                  <Input
                    id="piggy-name"
                    name="name"
                    placeholder="Reserva"
                    maxLength={100}
                    required
                  />
                  {state.errors?.name && (
                    <p className="text-xs text-destructive">
                      {state.errors.name[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="piggy-target"
                    className="text-sm font-medium text-foreground"
                  >
                    Meta
                  </label>
                  <Input
                    id="piggy-target"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="10000.00"
                    required
                  />
                  {state.errors?.targetAmount && (
                    <p className="text-xs text-destructive">
                      {state.errors.targetAmount[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="piggy-initial"
                    className="text-sm font-medium text-foreground"
                  >
                    Ja guardado
                  </label>
                  <Input
                    id="piggy-initial"
                    name="initialAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
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

export function PiggyIcon({ icon }: { icon?: string | null }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <PiggyBank className="h-6 w-6" />
      <span className="sr-only">{icon ?? "piggy"}</span>
    </div>
  );
}
