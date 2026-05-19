import "server-only";

import { apiFetch } from "@/lib/api/client";
import type {
  DashboardAlerts,
  DashboardCategory,
  DashboardSummary,
  Income,
  Transaction,
} from "@/lib/api/types";

type MonthYear = {
  month: number;
  year: number;
};

function monthYearParams({ month, year }: MonthYear) {
  return new URLSearchParams({
    month: String(month),
    year: String(year),
  });
}

export function getDashboardSummary(input: MonthYear) {
  return apiFetch<DashboardSummary>(`/dashboard/summary?${monthYearParams(input)}`);
}

export function getDashboardCategories(input: MonthYear) {
  return apiFetch<DashboardCategory[]>(
    `/dashboard/categories?${monthYearParams(input)}`,
  );
}

export function getDashboardAlerts() {
  return apiFetch<DashboardAlerts>("/dashboard/alerts");
}

export function getRecentTransactions(input: MonthYear) {
  return apiFetch<Transaction[]>(`/transactions?${monthYearParams(input)}`);
}

export function getMonthIncomes(input: MonthYear) {
  return apiFetch<Income[]>(`/incomes?${monthYearParams(input)}`);
}
