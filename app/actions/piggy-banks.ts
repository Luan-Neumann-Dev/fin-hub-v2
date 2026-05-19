"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createPiggyBank as createPiggyBankRequest,
  deletePiggyBank as deletePiggyBankRequest,
  depositPiggyBank,
  withdrawPiggyBank,
} from "@/lib/api/piggy-banks";

export type PiggyBankFormState = {
  ok?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    targetAmount?: string[];
    initialAmount?: string[];
    icon?: string[];
  };
};

export type PiggyBankMovementState = {
  ok?: boolean;
  message?: string;
  errors?: {
    amount?: string[];
  };
};

const createPiggyBankSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da meta.").max(100),
  targetAmount: z.coerce.number().positive("Informe uma meta maior que zero."),
  initialAmount: z.coerce.number().min(0).optional(),
  icon: z.string().trim().max(40).optional(),
});

const movementSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(["deposit", "withdraw"]),
  amount: z.coerce.number().positive("Informe um valor maior que zero."),
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

  return "Nao foi possivel concluir a operacao.";
}

export async function createPiggyBank(
  _: PiggyBankFormState,
  formData: FormData,
): Promise<PiggyBankFormState> {
  const parsed = createPiggyBankSchema.safeParse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    initialAmount: formData.get("initialAmount") || 0,
    icon: formData.get("icon") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    const piggyBank = await createPiggyBankRequest({
      name: parsed.data.name,
      targetAmount: parsed.data.targetAmount,
      icon: parsed.data.icon || undefined,
    });

    if (parsed.data.initialAmount && parsed.data.initialAmount > 0) {
      await depositPiggyBank(piggyBank.id, parsed.data.initialAmount);
    }

    revalidatePath("/piggy-banks");
    revalidatePath("/");

    return { ok: true, message: "Cofrinho criado." };
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function movePiggyBank(
  _: PiggyBankMovementState,
  formData: FormData,
): Promise<PiggyBankMovementState> {
  const parsed = movementSchema.safeParse({
    id: formData.get("id"),
    mode: formData.get("mode"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira o valor informado.",
    };
  }

  try {
    if (parsed.data.mode === "deposit") {
      await depositPiggyBank(parsed.data.id, parsed.data.amount);
    } else {
      await withdrawPiggyBank(parsed.data.id, parsed.data.amount);
    }

    revalidatePath("/piggy-banks");
    revalidatePath("/");

    return {
      ok: true,
      message: parsed.data.mode === "deposit" ? "Deposito realizado." : "Retirada realizada.",
    };
  } catch (error) {
    return { message: getErrorMessage(error) };
  }
}

export async function deletePiggyBank(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  await deletePiggyBankRequest(id);
  revalidatePath("/piggy-banks");
  revalidatePath("/");
}
