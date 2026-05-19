import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookieNames } from "@/lib/auth-cookies";
import type { User } from "@/lib/api/types";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export type Session = {
  accessToken: string;
  user: User;
};

function encodeUser(user: User) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

function decodeUser(value: string) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as User;
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(sessionCookieNames.accessToken)?.value ?? null;
}

export async function getSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(sessionCookieNames.accessToken)?.value;
  const userCookie = cookieStore.get(sessionCookieNames.user)?.value;
  const user = userCookie ? decodeUser(userCookie) : null;

  if (!accessToken || !user) return null;

  return { accessToken, user };
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function setSession(session: Session) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(sessionCookieNames.accessToken, session.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: ONE_WEEK_SECONDS,
    path: "/",
  });

  cookieStore.set(sessionCookieNames.user, encodeUser(session.user), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge: ONE_WEEK_SECONDS,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.delete(sessionCookieNames.accessToken);
  cookieStore.delete(sessionCookieNames.user);
}
