export const API = process.env.NEXT_PUBLIC_API_URL;

export const authHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchTickets() {
  const res = await fetch(`${API}/tickets`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("لطفاً ابتدا وارد شوید");
  if (!res.ok) throw new Error("خطا در دریافت تیکت‌ها");
  const data = await res.json();
  return (data.tickets ?? []) as import("./types").Ticket[];
}

export async function createTicket(title: string, description: string) {
  const res = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ title, description }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error("لطفاً ابتدا وارد شوید");
  if (!res.ok || !data.success) {
    throw new Error(
      data.error?.[0]?.message ?? data.error ?? "خطا در ثبت تیکت",
    );
  }
  return data;
}

export async function fetchMessages(ticketId: number) {
  const res = await fetch(`${API}/tickets/${ticketId}/messages`, {
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error("لطفاً ابتدا وارد شوید");
  if (!res.ok) throw new Error("خطا در دریافت پیام‌ها");
  const data = await res.json();
  return (data.messages ?? []) as import("./types").Message[];
}

export async function sendMessage(ticketId: number, message: string) {
  const res = await fetch(`${API}/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    throw new Error(
      data.error?.[0]?.message ?? data.error ?? "خطا در ارسال پیام",
    );
  }
  return data;
}
