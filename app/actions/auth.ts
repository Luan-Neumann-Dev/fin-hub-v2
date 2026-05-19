"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { loginRequest, logoutRequest, registerRequest } from "@/lib/api/auth";
import { clearSession, setSession } from "@/lib/session";

export type AuthFormState = {
  message?: string;
  errors?: {
    displayName?: string[];
    email?: string[];
    password?: string[];
  };
};

const authSchema = z.object({
  intent: z.enum(["login", "register"]),
  displayName: z.string().trim().optional(),
  email: z.email("Informe um email valido.").trim(),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Nao foi possivel autenticar agora.";
}

export async function authenticate(_: AuthFormState, formData: FormData) {
  const parsed = authSchema.safeParse({
    intent: formData.get("intent"),
    displayName: formData.get("displayName") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: "Confira os campos e tente novamente.",
    };
  }

  try {
    const payload =
      parsed.data.intent === "register"
        ? await registerRequest({
            email: parsed.data.email,
            password: parsed.data.password,
            displayName: parsed.data.displayName,
          })
        : await loginRequest({
            email: parsed.data.email,
            password: parsed.data.password,
          });

    await setSession({
      accessToken: payload.accessToken,
      user: payload.user,
    });
  } catch (error) {
    return {
      message: getAuthErrorMessage(error),
    };
  }

  redirect("/");
}

export async function logout() {
  try {
    await logoutRequest();
  } catch {
    // Logout no backend e stateless; o essencial para o front e limpar a sessao local.
  }

  await clearSession();
  redirect("/login");
}
