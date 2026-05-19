"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createInvestment as createInvestmentRequest,
  deleteInvestment as deleteInvestmentRequest,
  updateInvestment as updateInvestmentRequest,
} from "@/lib/api/investments";

export type InvestmentFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    id?: string[];
    name?: string[];
    type?: string[];
    investedAmount?: string[];
    currentAmount?: string[];
  };
};

const investmentSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1, "Informe o nome do investimento.").max(100),
  type: z.enum(["stock", "fixed_income", "crypto", "fund"], {
    error: "Selecione o tipo do investimento.",
  }),
  investedAmount: z.coerce.number().min(0, "Informe o valor investido."),
  currentAmount: z.coerce.number().min(0, "Informe o valor atual."),
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

export async function saveInvestment(
  _: InvestmentFormState,
  formData: FormData,
): Promise<InvestmentFormState> {
  const parsed = investmentSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    investedAmount: formData.get("investedAmount"),
    currentAmount: formData.get("currentAmount"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    const { id, ...payload } = parsed.data;

    if (id) {
      await updateInvestmentRequest(id, payload);
    } else {
      await createInvestmentRequest(payload);
    }

    revalidatePath("/investments");
    revalidatePath("/");
    revalidatePath("/reports");

    return { ok: true, message: id ? "Investimento atualizado." : "Investimento criado." };
  } catch (error) {
    return {
      message: getErrorMessage(error, "Nao foi possivel salvar o investimento."),
    };
  }
}

export async function deleteInvestment(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deleteInvestmentRequest(id);
  revalidatePath("/investments");
  revalidatePath("/");
  revalidatePath("/reports");
}
