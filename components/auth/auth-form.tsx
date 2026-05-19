"use client";

import { useActionState, useState } from "react";
import { Lock, Mail, User, Wallet } from "lucide-react";
import { authenticate, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

export function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [state, formAction, pending] = useActionState(authenticate, initialState);

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center">
        <div className="finance-gradient mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
          <Wallet className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Finance Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isRegister ? "Crie sua conta gratuita" : "Entrar em sua conta"}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input
          type="hidden"
          name="intent"
          value={isRegister ? "register" : "login"}
        />

        {isRegister && (
          <div className="space-y-1.5">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="displayName"
                className="pl-10"
                autoComplete="name"
                placeholder="Seu nome"
              />
            </div>
            {state.errors?.displayName && (
              <span className="text-xs text-destructive">
                {state.errors.displayName[0]}
              </span>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="email"
              type="email"
              className="pl-10"
              autoComplete="email"
              placeholder="Email"
              required
            />
          </div>
          {state.errors?.email && (
            <span className="text-xs text-destructive">
              {state.errors.email[0]}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="password"
              type="password"
              className="pl-10"
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="Senha"
              minLength={6}
              required
            />
          </div>
          {state.errors?.password && (
            <span className="text-xs text-destructive">
              {state.errors.password[0]}
            </span>
          )}
        </div>

        {state.message && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            {state.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {isRegister ? "Ja tem conta?" : "Nao tem conta?"}{" "}
        <button
          type="button"
          onClick={() => setIsRegister((value) => !value)}
          className="font-semibold text-primary hover:underline"
        >
          {isRegister ? "Faca login" : "Cadastre-se"}
        </button>
      </p>
    </div>
  );
}
