import "server-only";

import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/session";
import type { ApiResponse } from "@/lib/api/types";

const DEFAULT_API_URL = "http://localhost:3005/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export function getApiBaseUrl() {
  return process.env.CLEARFLOW_API_URL ?? DEFAULT_API_URL;
}

function buildUrl(path: string) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function readPayload(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}) {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;
  const requiresAuth = options.auth !== false;

  headers.set("Accept", "application/json");

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (requiresAuth) {
    const token = await getAccessToken();

    if (!token) {
      redirect("/login");
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
      body: hasBody ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Nao foi possivel conectar a API",
      0,
    );
  }

  const payload = await readPayload(response);
  const message =
    typeof payload === "object" && payload && "message" in payload
      ? String(payload.message)
      : response.statusText;

  if (response.status === 401 && requiresAuth) {
    redirect("/login");
  }

  if (!response.ok) {
    throw new ApiError(message || "Erro na API", response.status, payload);
  }

  const apiPayload = payload as ApiResponse<T>;

  if (apiPayload && apiPayload.success === false) {
    throw new ApiError(apiPayload.message || "Erro na API", response.status, apiPayload);
  }

  return apiPayload.data;
}
