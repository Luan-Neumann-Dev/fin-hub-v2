import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { PiggyBank } from "@/lib/api/types";

export function getPiggyBanks() {
  return apiFetch<PiggyBank[]>("/piggy-banks");
}

export function createPiggyBank(input: {
  name: string;
  targetAmount: number;
  icon?: string;
}) {
  return apiFetch<PiggyBank>("/piggy-banks", {
    method: "POST",
    body: input,
  });
}

export function depositPiggyBank(id: string, amount: number) {
  return apiFetch<PiggyBank>(`/piggy-banks/${id}/deposit`, {
    method: "POST",
    body: { amount },
  });
}

export function withdrawPiggyBank(id: string, amount: number) {
  return apiFetch<PiggyBank>(`/piggy-banks/${id}/withdraw`, {
    method: "POST",
    body: { amount },
  });
}

export function deletePiggyBank(id: string) {
  return apiFetch<null>(`/piggy-banks/${id}`, {
    method: "DELETE",
  });
}
