"use server";

import { revalidatePath } from "next/cache";
import { toggleClosedMonth } from "@/lib/month-closing";

export async function toggleMonthClosing(formData: FormData) {
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));
  const pathname = String(formData.get("pathname") || "/");

  if (!Number.isInteger(month) || !Number.isInteger(year)) return;
  if (month < 1 || month > 12 || year < 2000 || year > 2100) return;

  await toggleClosedMonth(month, year);
  revalidatePath(pathname);
}
