import { apiFetch } from "@/lib/api/client";
import type { Investment, InvestmentType } from "@/lib/api/types";

export type InvestmentFilters = {
  type?: InvestmentType;
};

function buildQuery(filters: InvestmentFilters = {}) {
  const params = new URLSearchParams();

  if (filters.type) params.set("type", filters.type);

  const query = params.toString();

  return query ? `?${query}` : "";
}

export function getInvestments(filters: InvestmentFilters = {}) {
  return apiFetch<Investment[]>(`/investments${buildQuery(filters)}`);
}

export function createInvestment(payload: {
  name: string;
  type: InvestmentType;
  investedAmount: number;
  currentAmount: number;
}) {
  return apiFetch<Investment>("/investments", {
    method: "POST",
    body: payload,
  });
}

export function updateInvestment(
  id: string,
  payload: {
    name?: string;
    type?: InvestmentType;
    investedAmount?: number;
    currentAmount?: number;
  },
) {
  return apiFetch<Investment>(`/investments/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteInvestment(id: string) {
  return apiFetch<null>(`/investments/${id}`, {
    method: "DELETE",
  });
}
