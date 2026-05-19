"use client";

import { useActionState, useState } from "react";
import { CreditCard, X } from "lucide-react";
import {
  createCreditCard,
  type CreditCardFormState,
} from "@/app/actions/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: CreditCardFormState = {};

const colorOptions = ["#7c3aed", "#0ea5e9", "#22c55e", "#ef4444", "#f59e0b"];

export function CreditCardDialog() {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(colorOptions[0]);
  const [state, formAction, pending] = useActionState(
    createCreditCard,
    initialState,
  );

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <CreditCard className="h-4 w-4" />
        Novo cartao
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border bg-popover p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Novo cartao
                </h2>
                <p className="text-sm text-muted-foreground">
                  Cadastre o cartao que sera usado nas faturas.
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
                  htmlFor="card-name"
                  className="text-sm font-medium text-foreground"
                >
                  Nome
                </label>
                <Input
                  id="card-name"
                  name="name"
                  placeholder="Nubank"
                  maxLength={100}
                  required
                />
                {state.errors?.name && (
                  <p className="text-xs text-destructive">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Cor</p>
                <input type="hidden" name="color" value={color} />
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setColor(option)}
                      className="h-9 w-9 rounded-full border-2 transition-transform hover:scale-105"
                      style={{
                        backgroundColor: option,
                        borderColor: color === option ? "white" : "transparent",
                        boxShadow:
                          color === option
                            ? "0 0 0 2px hsl(var(--ring))"
                            : undefined,
                      }}
                      aria-label={`Selecionar cor ${option}`}
                    />
                  ))}
                </div>
                {state.errors?.color && (
                  <p className="text-xs text-destructive">
                    {state.errors.color[0]}
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
