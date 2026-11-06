import type { Ticket } from "./types";

export const statusStyles: Record<Ticket["status"], string> = {
  open: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  resolved: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

export const statusLabels: Record<Ticket["status"], string> = {
  open: "باز",
  pending: "در حال بررسی",
  resolved: "حل شده",
  closed: "بسته",
};

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fa-IR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
