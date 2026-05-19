import { apiFetch } from "@/lib/api/client";
import type { Invoice, InvoicePurchase, InvoiceStatus } from "@/lib/api/types";

export type InvoiceFilters = {
  creditCardId?: string;
  status?: InvoiceStatus;
};

function buildInvoiceQuery(filters: InvoiceFilters = {}) {
  const params = new URLSearchParams();

  if (filters.creditCardId) params.set("creditCardId", filters.creditCardId);
  if (filters.status) params.set("status", filters.status);

  const query = params.toString();

  return query ? `/invoices?${query}` : "/invoices";
}

export function getInvoices(filters: InvoiceFilters = {}) {
  return apiFetch<Invoice[]>(buildInvoiceQuery(filters));
}

export function getInvoice(id: string) {
  return apiFetch<Invoice>(`/invoices/${id}`);
}

export function createInvoice(payload: {
  creditCardId: string;
  dueDate: string;
  closingDate?: string;
  status?: InvoiceStatus;
}) {
  return apiFetch<Invoice>("/invoices", {
    method: "POST",
    body: payload,
  });
}

export function updateInvoice(
  id: string,
  payload: {
    dueDate?: string;
    closingDate?: string;
    status?: InvoiceStatus;
  },
) {
  return apiFetch<Invoice>(`/invoices/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteInvoice(id: string) {
  return apiFetch<null>(`/invoices/${id}`, {
    method: "DELETE",
  });
}

export function createInvoicePurchase(
  invoiceId: string,
  payload: {
    description: string;
    amount: number;
    date: string;
    category?: string;
  },
) {
  return apiFetch<{ purchase: InvoicePurchase; invoice: Invoice }>(
    `/invoices/${invoiceId}/purchases`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function deleteInvoicePurchase(invoiceId: string, purchaseId: string) {
  return apiFetch<Invoice>(`/invoices/${invoiceId}/purchases/${purchaseId}`, {
    method: "DELETE",
  });
}
