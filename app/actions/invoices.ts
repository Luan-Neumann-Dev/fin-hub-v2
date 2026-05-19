"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createCreditCard as createCreditCardRequest,
  deleteCreditCard as deleteCreditCardRequest,
} from "@/lib/api/credit-cards";
import {
  createInvoice as createInvoiceRequest,
  createInvoicePurchase as createInvoicePurchaseRequest,
  deleteInvoice as deleteInvoiceRequest,
  deleteInvoicePurchase as deleteInvoicePurchaseRequest,
  updateInvoice as updateInvoiceRequest,
} from "@/lib/api/invoices";

export type CreditCardFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    color?: string[];
  };
};

export type InvoiceFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    creditCardId?: string[];
    dueDate?: string[];
    closingDate?: string[];
    status?: string[];
  };
};

export type InvoicePurchaseFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    invoiceId?: string[];
    description?: string[];
    amount?: string[];
    date?: string[];
    category?: string[];
  };
};

const colorRegex = /^#[0-9a-fA-F]{6}$/;

const creditCardSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do cartao.").max(100),
  color: z
    .string()
    .trim()
    .regex(colorRegex, "Informe uma cor hexadecimal valida.")
    .optional(),
});

const invoiceSchema = z.object({
  creditCardId: z.string().trim().min(1, "Selecione um cartao."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida."),
  closingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida.")
    .optional(),
  status: z.enum(["open", "closed", "overdue"]).optional(),
});

const purchaseSchema = z.object({
  invoiceId: z.string().trim().min(1, "Selecione uma fatura."),
  description: z.string().trim().min(1, "Informe a descricao.").max(160),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida."),
  category: z.string().trim().max(80).optional(),
});

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return fallback;
}

export async function createCreditCard(
  _: CreditCardFormState,
  formData: FormData,
): Promise<CreditCardFormState> {
  const parsed = creditCardSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    await createCreditCardRequest(parsed.data);
    revalidatePath("/invoices");

    return { ok: true, message: "Cartao criado." };
  } catch (error) {
    return { message: getErrorMessage(error, "Nao foi possivel criar o cartao.") };
  }
}

export async function createInvoice(
  _: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const parsed = invoiceSchema.safeParse({
    creditCardId: formData.get("creditCardId"),
    dueDate: formData.get("dueDate"),
    closingDate: formData.get("closingDate") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    await createInvoiceRequest(parsed.data);
    revalidatePath("/invoices");
    revalidatePath("/");

    return { ok: true, message: "Fatura criada." };
  } catch (error) {
    return { message: getErrorMessage(error, "Nao foi possivel criar a fatura.") };
  }
}

export async function createInvoicePurchase(
  _: InvoicePurchaseFormState,
  formData: FormData,
): Promise<InvoicePurchaseFormState> {
  const parsed = purchaseSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    const { invoiceId, ...payload } = parsed.data;

    await createInvoicePurchaseRequest(invoiceId, payload);
    revalidatePath("/invoices");
    revalidatePath("/");

    return { ok: true, message: "Compra adicionada." };
  } catch (error) {
    return { message: getErrorMessage(error, "Nao foi possivel adicionar a compra.") };
  }
}

export async function updateInvoiceStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !["open", "closed", "overdue"].includes(status)) return;

  await updateInvoiceRequest(id, {
    status: status as "open" | "closed" | "overdue",
  });
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function deleteInvoice(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteInvoiceRequest(id);
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function deleteCreditCard(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteCreditCardRequest(id);
  revalidatePath("/invoices");
  revalidatePath("/");
}

export async function deleteInvoicePurchase(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const purchaseId = String(formData.get("purchaseId") ?? "");

  if (!invoiceId || !purchaseId) return;

  await deleteInvoicePurchaseRequest(invoiceId, purchaseId);
  revalidatePath("/invoices");
  revalidatePath("/");
}
