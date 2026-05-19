"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createIncome as createIncomeRequest,
  deleteIncome as deleteIncomeRequest,
} from "@/lib/api/incomes";

export type IncomeFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    amount?: string[];
    date?: string[];
    type?: string[];
  };
};

const createIncomeSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da receita."),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida."),
  type: z.enum(["fixed", "variable"], {
    error: "Selecione o tipo da receita.",
  }),
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

  return "Nao foi possivel salvar a receita.";
}

export async function createIncome(
  _: IncomeFormState,
  formData: FormData,
): Promise<IncomeFormState> {
  const parsed = createIncomeSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    type: formData.get("type"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    await createIncomeRequest(parsed.data);
    revalidatePath("/incomes");

    return { ok: true, message: "Receita criada." };
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function deleteIncome(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteIncomeRequest(id);
  revalidatePath("/incomes");
}
