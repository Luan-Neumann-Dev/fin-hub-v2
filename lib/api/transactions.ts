import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Transaction } from "@/lib/api/types";

export type TransactionFilters = {
  month?: number;
  year?: number;
  status?: "paid" | "pending";
  type?: "fixed" | "variable" | "installment";
  categoryId?: string;
};

function buildQuery(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();

  if (filters.month) params.set("month", String(filters.month));
  if (filters.year) params.set("year", String(filters.year));
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getTransactions(filters: TransactionFilters = {}) {
  return apiFetch<Transaction[]>(`/transactions${buildQuery(filters)}`);
}

export function createTransaction(input: {
  description: string;
  amount: number;
  date: string;
  categoryId?: string;
  type: "fixed" | "variable" | "installment";
  status: "paid" | "pending";
  totalInstallments?: number;
}) {
  return apiFetch<Transaction | Transaction[]>("/transactions", {
    method: "POST",
    body: input,
  });
}

export function payTransaction(id: string) {
  return apiFetch<Transaction>(`/transactions/${id}/pay`, {
    method: "PATCH",
  });
}

export function deleteTransaction(id: string) {
  return apiFetch<null>(`/transactions/${id}`, {
    method: "DELETE",
  });
}
