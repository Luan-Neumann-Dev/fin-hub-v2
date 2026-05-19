import "server-only";

import { cookies } from "next/headers";

const CLOSED_MONTHS_COOKIE = "finance_hub_closed_months";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function monthKey(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

async function getClosedMonthKeys() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CLOSED_MONTHS_COOKIE)?.value;

  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function isMonthClosed(month: number, year: number) {
  const keys = await getClosedMonthKeys();

  return keys.includes(monthKey(month, year));
}

export async function toggleClosedMonth(month: number, year: number) {
  const cookieStore = await cookies();
  const keys = await getClosedMonthKeys();
  const key = monthKey(month, year);
  const nextKeys = keys.includes(key)
    ? keys.filter((item) => item !== key)
    : [...keys, key];

  cookieStore.set(CLOSED_MONTHS_COOKIE, JSON.stringify(nextKeys), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR_SECONDS,
    path: "/",
  });
}
