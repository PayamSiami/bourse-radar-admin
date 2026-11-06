"use client";

import Link from "next/link";
import type { Ticket } from "@/lib/tickets/types";
import { formatDate } from "@/lib/tickets/constants";
import { StatusBadge } from "./StatusBadge";

export function TicketList({
    tickets,
    loading,
}: {
    tickets: Ticket[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <svg
                    className="animate-spin w-6 h-6 text-brand-500"
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.599z"
                    />
                </svg>
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center py-10 text-muted bg-surface-2/30 rounded-xl border border-app/50">
                <p className="text-sm font-medium text-fg mb-1">
                    هنوز تیکتی ثبت نکرده‌اید
                </p>
                <p className="text-xs">برای ثبت اولین تیکت از فرم بالا استفاده کنید</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {tickets.map((ticket) => (
                <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block w-full text-right p-3 bg-surface hover:bg-surface-2 border border-app
                     rounded-lg text-sm transition-all hover:shadow-sm"
                >
                    <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-fg">{ticket.title}</div>
                        <StatusBadge status={ticket.status} />
                    </div>
                    <div className="text-muted text-xs mt-1 line-clamp-1">
                        {ticket.lastMessage || ticket.description || "بدون پیام"}
                    </div>
                    <div className="text-muted text-[10px] mt-1 flex justify-between">
                        <span>#{ticket.id}</span>
                        <span>{formatDate(ticket.lastMessageAt ?? ticket.createdAt)}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
}