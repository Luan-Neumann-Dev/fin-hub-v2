import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { AuthPayload } from "@/lib/api/types";

export function loginRequest(input: { email: string; password: string }) {
  return apiFetch<AuthPayload>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function registerRequest(input: {
  email: string;
  password: string;
  displayName?: string;
}) {
  return apiFetch<AuthPayload>("/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function logoutRequest() {
  return apiFetch<null>("/auth/logout", {
    method: "POST",
  });
}
