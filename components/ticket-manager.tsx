import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

/**
 * TicketManager: Allows users to add/remove tickers from custom watchlist.
 */
export function TicketManager() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch current tickers on mount
  useEffect(() => {
    const loadTickers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/tickers");
        if (!response.ok) throw new Error("Failed to load tickers");
        
        const data = await response.json();
        if (data.success) {
          setTickers(data.data.map((t: any) => t.symbol));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading tickers");
      } finally {
        setLoading(false);
      }
    };

    loadTickers();
  }, []);

  // Add ticker handler
  const handleAddTicker = async () => {
    if (!newTicker.trim()) return;

    try {
      setIsAdding(true);
      const response = await fetch("/api/tickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: newTicker.trim().toUpperCase() }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to add ticker");

      // Refresh tickers list
      const updatedResponse = await handleGetTickers();
      if (updatedResponse.success) {
        setTickers(updatedResponse.data.map((t: any) => t.symbol));
        setNewTicker("");
        setIsAdding(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add ticker");
      setIsAdding(false);
    }
  };

  // Remove ticker handler
  const handleRemoveTicker = async (symbol: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      setIsRemoving(true);
      const response = await fetch(`/api/tickers/${symbol}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to remove ticker");

      // Remove from state with CSS animation
      setTickers((prev) => prev.filter((t) => t !== symbol));
      setIsRemoving(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove ticker");
      setIsRemoving(false);
    }
  };

  // Get tickers (for refresh)
  const handleGetTickers = async () => {
    try {
      const response = await fetch("/api/tickers");
      if (!response.ok) throw new Error("Failed to fetch tickers");
      return await response.json();
    } catch (err) {
      throw err;
    }
  };

  return (
    <Card className="mb-8 overflow-hidden transition-all hover:shadow-lg">
      {/* Card header with gradient */}
      <div className="bg-linear-to-r from-brand-500/5 to-emerald-500/5 dark:from-brand-500/10 dark:to-emerald-500/10 px-6 py-4 border-b border-app">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-linear-to-r from-brand-500 to-emerald-500 rounded-full animate-pulse" />
            <span className="text-[17px] font-bold text-fg">تیکت های شخصی من</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted px-2.5 py-1.5 bg-surface-2 rounded-full border border-app">
              {tickers.length} بدون تیکر
            </span>
            <span className="text-[10px] text-muted flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 14 14 10 10 0 0 0-14-14Zm0 10a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
              </svg>
              جمع‌بندی دوستانه
            </span>
          </div>
        </CardTitle>
      </div>

      <CardContent className="p-6">
        {/* Search Input with icon */}
        <div className="relative mb-5">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <Input
            type="text"
            placeholder="نماد (مثلاً فولاد - بدون فاصله)"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTicker()}
            disabled={loading || isAdding}
            className="pr-10 pl-3 py-2.5 text-sm focus:border-brand-500 transition-colors font-medium"
          />
          <button
            onClick={handleAddTicker}
            disabled={loading || isAdding || !newTicker.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center
                       bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       hover:shadow-md hover:scale-105 active:scale-95"
          >
            {isAdding ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.599z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </button>
        </div>

        {/* Error message with contextual styling */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Tickers list with hover effects */}
        <div className="flex flex-wrap gap-2">
          {tickers.map((symbol, index) => (
            <div
              key={symbol}
              className="flex items-center gap-2 px-3.5 py-2 bg-surface hover:bg-surface-2 hover:ring-2 hover:ring-brand-400/30
                         border border-app rounded-full text-sm group transition-all duration-200 shadow-sm
                         hover:shadow-md hover:-translate-y-0.5 animate-in slide-in-from-right-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="font-bold text-fg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {symbol}
              </span>
              <button
                onClick={(e) => handleRemoveTicker(symbol, e)}
                disabled={loading || isRemoving}
                className="text-muted hover:text-red-600 dark:hover:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-500/10 p-1 rounded-full
                           transition-all duration-200 
                           group-hover:opacity-100 opacity-60
                           hover:scale-110 active:scale-95"
                title="حذف از لیست"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Empty state with enhanced design */}
        {tickers.length === 0 && !loading && (
          <div className="text-center py-10 text-muted bg-surface-2/30 rounded-xl border border-app/50">
            <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-2">
              <svg className="w-6 h-6 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <p className="text-sm font-medium text-fg mb-1">لیست تیکرهای شخصی خالی است</p>
            <p className="text-xs">برای اضافه کردن یک نماد، از جعبه بالا استفاده کنید</p>
          </div>
        )}

        {/* Loading state with shimmer effect */}
        {loading && (
          <div className="flex justify-center py-8">
            <svg className="animate-spin w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.599z" />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
