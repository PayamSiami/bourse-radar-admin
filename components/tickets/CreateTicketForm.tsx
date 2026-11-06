"use client";

import { useState } from "react";
import { createTicket } from "@/lib/tickets/api";

interface Props {
    onCreated: () => void;
    onError: (msg: string) => void;
}

export function CreateTicketForm({ onCreated, onError }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            onError("عنوان و توضیحات الزامی هستند");
            return;
        }
        try {
            setIsAdding(true);
            await createTicket(title.trim(), description.trim());
            setTitle("");
            setDescription("");
            onCreated();
        } catch (err) {
            onError(err instanceof Error ? err.message : "خطا در ثبت تیکت");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="mb-5 space-y-3">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان تیکت (مثلاً: مشکل در ورود)"
                maxLength={255}
                className="w-full px-3.5 py-2.5 bg-surface border border-app rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات تیکت..."
                maxLength={1000}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-surface border border-app rounded-lg text-sm
                   focus:outline-none focus:ring-2 focus:ring-brand-400/40 resize-none"
            />
            <button
                onClick={handleSubmit}
                disabled={isAdding || !title.trim() || !description.trim()}
                className="w-full h-10 flex items-center justify-center gap-2
                   bg-brand-500 hover:bg-brand-600 rounded-lg transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:shadow-md active:scale-[0.99]"
            >
                {isAdding ? "در حال ثبت..." : "ثبت تیکت"}
            </button>
        </div>
    );
}