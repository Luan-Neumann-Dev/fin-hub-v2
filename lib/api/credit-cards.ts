import { apiFetch } from "@/lib/api/client";
import type { CreditCard } from "@/lib/api/types";

export function getCreditCards() {
  return apiFetch<CreditCard[]>("/credit-cards");
}

export function createCreditCard(payload: { name: string; color?: string }) {
  return apiFetch<CreditCard>("/credit-cards", {
    method: "POST",
    body: payload,
  });
}

export function deleteCreditCard(id: string) {
  return apiFetch<null>(`/credit-cards/${id}`, {
    method: "DELETE",
  });
}
