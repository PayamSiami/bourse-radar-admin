export interface Ticket {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  status: "open" | "pending" | "resolved" | "closed";
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  ticketId: number;
  userId: number;
  message: string;
  createdAt: string;
}
