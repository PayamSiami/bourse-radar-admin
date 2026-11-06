"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Message } from "@/lib/tickets/types";
import { fetchMessages } from "@/lib/tickets/api";
import { formatDate } from "@/lib/tickets/constants";

export function TicketConversation({ ticketId }: { ticketId: number }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId] = useState<number | null>(() => {
        // Check if in browser environment (prevent SSR error)
        if (typeof window === "undefined") return null;
        try {
            const raw = localStorage.getItem("user");
            const user = raw ? JSON.parse(raw) : null;
            return typeof user?.id === "number" ? user.id : null;
        } catch {
            return null;
        }
    });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const msgs = await fetchMessages(ticketId);
            setMessages(
                [...msgs].sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "خطا");
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        load();
    }, [load]);

    const isMine = useCallback(
        (m: Message) => currentUserId !== null && m.userId === currentUserId,
        [currentUserId],
    );

    const rendered = useMemo(
        () =>
            messages.map((m, i) => {
                const mine = isMine(m);
                const prev = messages[i - 1];
                const showHeader = !prev || isMine(prev) !== mine;
                return { message: m, mine, showHeader };
            }),
        [messages, isMine],
    );

    return (
        <div className="space-y-2 max-h-96 overflow-y-auto px-1">
            {loading && (
                <div className="text-center text-muted text-sm py-4">
                    در حال بارگذاری...
                </div>
            )}

            {error && (
                <div className="p-2 text-sm bg-red-50 text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {!loading &&
                rendered.map(({ message: m, mine, showHeader }) => (
                    <div key={m.id}>
                        {showHeader && (
                            <div
                                className={`text-[10px] text-muted mb-1 ${mine ? "text-right" : "text-left"
                                    }`}
                            >
                                {mine ? "شما" : "پشتیبانی"}
                            </div>
                        )}
                        <div
                            className={`flex ${mine ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] p-3 rounded-lg border text-sm ${mine
                                    ? "bg-brand-500/10 border-brand-500/30 text-fg"
                                    : "bg-surface-2 border-app text-fg"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">
                                    {m.message}
                                </div>
                                <div className="text-[10px] text-muted mt-1">
                                    {formatDate(m.createdAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            {!loading && messages.length === 0 && (
                <div className="text-center text-muted text-sm py-6">
                    هنوز پیامی وجود ندارد
                </div>
            )}
        </div>
    );
}