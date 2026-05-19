import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Income } from "@/lib/api/types";

export type IncomeFilters = {
  month?: number;
  year?: number;
  type?: "fixed" | "variable";
};

function buildQuery(filters: IncomeFilters = {}) {
  const params = new URLSearchParams();

  if (filters.month) params.set("month", String(filters.month));
  if (filters.year) params.set("year", String(filters.year));
  if (filters.type) params.set("type", filters.type);

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getIncomes(filters: IncomeFilters = {}) {
  return apiFetch<Income[]>(`/incomes${buildQuery(filters)}`);
}

export function createIncome(input: {
  name: string;
  amount: number;
  date: string;
  type: "fixed" | "variable";
}) {
  return apiFetch<Income>("/incomes", {
    method: "POST",
    body: input,
  });
}

export function deleteIncome(id: string) {
  return apiFetch<null>(`/incomes/${id}`, {
    method: "DELETE",
  });
}
