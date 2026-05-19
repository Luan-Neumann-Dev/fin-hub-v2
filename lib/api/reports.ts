import { apiFetch } from "@/lib/api/client";
import type {
  CashflowReportItem,
  CategoryReportItem,
  MonthlyEvolutionReportItem,
} from "@/lib/api/types";

function monthsQuery(months: number) {
  return new URLSearchParams({ months: String(months) });
}

export function getCashflowReport(months: number) {
  return apiFetch<CashflowReportItem[]>(
    `/reports/cashflow?${monthsQuery(months)}`,
  );
}

export function getMonthlyEvolutionReport(months: number) {
  return apiFetch<MonthlyEvolutionReportItem[]>(
    `/reports/monthly-evolution?${monthsQuery(months)}`,
  );
}

export function getCategoriesReport(input: {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
}) {
  const params = new URLSearchParams();

  if (input.month) params.set("month", String(input.month));
  if (input.year) params.set("year", String(input.year));
  if (input.startDate) params.set("startDate", input.startDate);
  if (input.endDate) params.set("endDate", input.endDate);

  return apiFetch<CategoryReportItem[]>(`/reports/categories?${params}`);
}
