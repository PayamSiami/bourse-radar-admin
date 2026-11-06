import type { ProfileFormData } from "./types";

/** Safely turn `null | undefined` into a string for form state */
export const s = (v: unknown): string => (typeof v === "string" ? v : "");

/** Extract the best possible error message from an API response body */
export function extractErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, unknown>;
  if (typeof b.message === "string" && b.message.trim()) return b.message;
  if (typeof b.error === "string" && b.error.trim()) return b.error;
  if (Array.isArray(b.error) && b.error[0] && typeof b.error[0] === "object") {
    const first = b.error[0] as Record<string, unknown>;
    if (typeof first.message === "string" && first.message.trim())
      return first.message;
  }
  return fallback;
}

/** Build form state from any "user-like" object (server or localStorage) */
export function toFormData(user: any, fallbackEmail = ""): ProfileFormData {
  return {
    displayName: s(user?.displayName),
    email: s(user?.email) || fallbackEmail,
    avatarUrl: s(user?.avatarUrl),
    phone: s(user?.phone),
    country: s(user?.country),
    city: s(user?.city),
  };
}
