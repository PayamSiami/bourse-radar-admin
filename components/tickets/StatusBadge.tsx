import type { Ticket } from "@/lib/tickets/types";
import { statusLabels, statusStyles } from "@/lib/tickets/constants";

export function StatusBadge({ status }: { status: Ticket["status"] }) {
    return (
        <span
            className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${statusStyles[status]}`}
        >
            {statusLabels[status]}
        </span>
    );
}