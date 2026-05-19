"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createTransaction as createTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  payTransaction as payTransactionRequest,
} from "@/lib/api/transactions";
import { isMonthClosed } from "@/lib/month-closing";

export type ExpenseFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    description?: string[];
    amount?: string[];
    date?: string[];
    categoryId?: string[];
    type?: string[];
    status?: string[];
    totalInstallments?: string[];
  };
};

const createExpenseSchema = z
  .object({
    description: z.string().trim().min(1, "Informe a descricao da despesa."),
    amount: z.coerce.number().positive("Informe um valor maior que zero."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida."),
    categoryId: z.string().trim().optional(),
    type: z.enum(["fixed", "variable", "installment"], {
      error: "Selecione o tipo da despesa.",
    }),
    status: z.enum(["paid", "pending"], {
      error: "Selecione o status da despesa.",
    }),
    totalInstallments: z.coerce.number().int().min(2).max(120).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "installment" && !value.totalInstallments) {
      ctx.addIssue({
        code: "custom",
        path: ["totalInstallments"],
        message: "Informe a quantidade de parcelas.",
      });
    }
  });

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Nao foi possivel salvar a despesa.";
}

function monthYearFromDate(date: string) {
  const [year, month] = date.split("-").map(Number);

  return { month, year };
}

export async function createExpense(
  _: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const parsed = createExpenseSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId") || undefined,
    type: formData.get("type"),
    status: formData.get("status"),
    totalInstallments: formData.get("totalInstallments") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  const { month, year } = monthYearFromDate(parsed.data.date);

  if (await isMonthClosed(month, year)) {
    return { message: "Este mes esta fechado." };
  }

  try {
    await createTransactionRequest({
      ...parsed.data,
      categoryId: parsed.data.categoryId || undefined,
      status: parsed.data.type === "installment" ? "pending" : parsed.data.status,
      totalInstallments:
        parsed.data.type === "installment"
          ? parsed.data.totalInstallments
          : undefined,
    });
    revalidatePath("/expenses");
    revalidatePath("/");

    return { ok: true, message: "Despesa criada." };
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function markExpenseAsPaid(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));

  if (!id) return;
  if (await isMonthClosed(month, year)) return;

  await payTransactionRequest(id);
  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));

  if (!id) return;
  if (await isMonthClosed(month, year)) return;

  await deleteTransactionRequest(id);
  revalidatePath("/expenses");
  revalidatePath("/");
}
