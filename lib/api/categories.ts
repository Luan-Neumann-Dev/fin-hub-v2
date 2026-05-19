import "server-only";

import { apiFetch } from "@/lib/api/client";
import type { Category } from "@/lib/api/types";

export function getCategories() {
  return apiFetch<Category[]>("/categories");
}
