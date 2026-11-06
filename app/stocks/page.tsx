"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  FolderGit2,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  isin?: string;
  shares_outstanding?: number;
  lastUpdated?: string;
}

const emptyForm = {
  symbol: "",
  name: "",
  sector: "",
  isin: "",
  shares_outstanding: "",
};

type SortKey = "symbol" | "name" | "sector" | "shares_outstanding" | "lastUpdated";
type SortDir = "asc" | "desc";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

export default function AdminStocksPage() {
  const { token } = useAuth();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const fetchStocks = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/stocks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("خطا در دریافت سهام");

        const result = await response.json();
        const list: Stock[] = result.data || result.stocks || [];
        setStocks(list);
      } catch (err: any) {
        setError(err.message || "خطایی در بارگذاری سهام رخ داده است");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Escape closes modal + delete dialog
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSubmitting || isDeleting) return;
        closeModal();
        setStockToDelete(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting, isDeleting]);

  /* ── Filter + sort (memoized) ── */
  const filteredStocks = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = !q
      ? stocks
      : stocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(q) ||
          stock.symbol.toLowerCase().includes(q) ||
          stock.sector.toLowerCase().includes(q) ||
          (stock.isin?.toLowerCase().includes(q) ?? false)
      );

    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv), "fa") * dir;
    });
  }, [stocks, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.symbol.trim()) errors.symbol = "نماد سهام الزامی است";
    if (!formData.name.trim()) errors.name = "نام شرکت الزامی است";
    if (!formData.sector.trim()) errors.sector = "صنف الزامی است";
    if (
      formData.shares_outstanding &&
      (isNaN(Number(formData.shares_outstanding)) ||
        Number(formData.shares_outstanding) < 0)
    ) {
      errors.shares_outstanding = "تعداد سهام باید عدد معتبر باشد";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingStock(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      isin: stock.isin || "",
      shares_outstanding: stock.shares_outstanding?.toString() || "",
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStock(null);
    setFormData(emptyForm);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors((prev) => {
      const { _form, ...rest } = prev;
      return rest;
    });

    try {
      if (editingStock) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stocks/${editingStock.symbol}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              shares_outstanding: formData.shares_outstanding
                ? Number(formData.shares_outstanding)
                : undefined,
            }),
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || "خطا در بروزرسانی سهام");
        }

        pushToast("success", `سهم «${formData.symbol}» با موفقیت بروزرسانی شد`);
      } else {
        throw new Error(
          "افزودن سهام جدید هنوز در بک‌اند پیاده‌سازی نشده است"
        );
      }

      await fetchStocks(true);
      closeModal();
    } catch (err: any) {
      setFormErrors((prev) => ({
        ...prev,
        _form: err.message || "خطایی رخ داد",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!stockToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stocks/${stockToDelete.symbol}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("خطا در حذف سهام");

      const deletedSymbol = stockToDelete.symbol;
      await fetchStocks(true);
      setStockToDelete(null);
      pushToast("success", `سهم «${deletedSymbol}» حذف شد`);
    } catch (err: any) {
      pushToast("error", err.message || "خطایی در حذف رخ داد");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fa-IR");
    } catch {
      return "—";
    }
  };

  const formatNumber = (n?: number) =>
    n != null ? new Intl.NumberFormat("fa-IR").format(n) : "—";

  const getSectorBadge = (sector: string) => {
    const s = sector.toLowerCase();
    let classes = "bg-muted text-muted-foreground border-border";

    if (s.includes("فلز"))
      classes =
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    else if (s.includes("شیمیایی") || s.includes("پتروشیمی"))
      classes =
        "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    else if (s.includes("خودرو"))
      classes = "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    else if (s.includes("بانک") || s.includes("مالی"))
      classes =
        "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    else if (s.includes("سرمایه") || s.includes("بیمه"))
      classes =
        "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20";

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
      >
        {sector}
      </span>
    );
  };

  const SortHeader = ({
    label,
    column,
    className = "",
  }: {
    label: string;
    column: SortKey;
    className?: string;
  }) => (
    <th className={`px-5 py-3.5 text-right font-semibold text-foreground whitespace-nowrap ${className}`}>
      <button
        onClick={() => toggleSort(column)}
        className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      >
        {label}
        <ArrowUpDown
          size={13}
          className={`transition-opacity ${sortKey === column
              ? "opacity-100 text-blue-600 dark:text-blue-400"
              : "opacity-40 group-hover:opacity-70"
            } ${sortKey === column && sortDir === "desc" ? "rotate-180" : ""}`}
        />
      </button>
    </th>
  );

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 w-36 rounded-lg bg-muted animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="h-12 bg-muted/50 animate-pulse" />
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error && stocks.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-red-500/10 p-4 mb-4">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h3 className="text-lg font-semibold mb-1">خطا در بارگذاری</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
        <Button onClick={() => fetchStocks()} variant="outline">
          <RefreshCw size={16} className="ml-2" />
          تلاش مجدد
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            مدیریت سهام
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stocks.length.toLocaleString("fa-IR")} سهم ثبت‌شده
            {search && (
              <>
                {" "}
                · {filteredStocks.length.toLocaleString("fa-IR")} نتیجه جستجو
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={18}
            />
            <input
              type="search"
              placeholder="جستجو بر اساس نماد، نام یا صنف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full sm:w-64 lg:w-72 h-10 pr-10 pl-10 rounded-xl border border-border
                bg-background text-sm
                placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              "
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="پاک کردن جستجو"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStocks(true)}
              disabled={isRefreshing}
              className="h-10"
            >
              <RefreshCw
                size={16}
                className={`ml-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "در حال بروزرسانی" : "بروزرسانی"}
            </Button>

            <Button onClick={openAddModal} className="h-10">
              <Plus size={18} className="ml-2" />
              افزودن سهم
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <SortHeader label="نماد" column="symbol" />
                <SortHeader
                  label="نام شرکت"
                  column="name"
                  className="hidden md:table-cell"
                />
                <SortHeader label="صنف" column="sector" />
                <th className="px-5 py-3.5 text-right font-semibold text-foreground whitespace-nowrap hidden md:table-cell">
                  ISIN
                </th>
                <SortHeader
                  label="تعداد سهام"
                  column="shares_outstanding"
                  className="hidden lg:table-cell"
                />
                <SortHeader
                  label="آخرین بروزرسانی"
                  column="lastUpdated"
                  className="hidden lg:table-cell"
                />
                <th className="px-5 py-3.5 text-right font-semibold text-foreground whitespace-nowrap">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                        <FolderGit2
                          className="text-blue-600 dark:text-blue-400"
                          size={18}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {stock.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden truncate">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="font-medium text-foreground line-clamp-1">
                      {stock.name}
                    </span>
                  </td>

                  <td className="px-5 py-4">{getSectorBadge(stock.sector)}</td>

                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell font-mono text-xs">
                    {stock.isin || "—"}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell tabular-nums">
                    {formatNumber(stock.shares_outstanding)}
                  </td>

                  <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">
                    {formatDate(stock.lastUpdated)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(stock)}
                        className="
                          inline-flex h-8 w-8 items-center justify-center rounded-lg
                          text-blue-600 dark:text-blue-400
                          bg-blue-500/10 hover:bg-blue-500/20
                          transition-colors
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                        "
                        title="ویرایش"
                        aria-label={`ویرایش ${stock.symbol}`}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => setStockToDelete(stock)}
                        className="
                          inline-flex h-8 w-8 items-center justify-center rounded-lg
                          text-red-600 dark:text-red-400
                          bg-red-500/10 hover:bg-red-500/20
                          transition-colors
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                        "
                        title="حذف"
                        aria-label={`حذف ${stock.symbol}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredStocks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FolderGit2 className="text-muted-foreground" size={32} />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {search ? "نتیجه‌ای یافت نشد" : "هیچ سهمی ثبت نشده"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              {search
                ? `هیچ سهمی با عبارت «${search}» پیدا نشد.`
                : "برای شروع، اولین سهم را اضافه کنید."}
            </p>
            {search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                پاک کردن جستجو
              </Button>
            ) : (
              <Button onClick={openAddModal}>
                <Plus size={16} className="ml-2" />
                افزودن سهم
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ───────────── Add / Edit Modal ───────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => !isSubmitting && closeModal()}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="stock-modal-title"
            className="
              relative z-10 w-full max-w-lg
              rounded-2xl border border-border bg-white shadow-2xl
              animate-in fade-in zoom-in-95 duration-200
            "
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="stock-modal-title" className="text-lg font-semibold">
                {editingStock ? "ویرایش سهم" : "افزودن سهم جدید"}
              </h2>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="بستن"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {formErrors._form && (
                <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3 text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{formErrors._form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Symbol */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="field-symbol"
                    className="text-sm font-medium text-foreground"
                  >
                    نماد سهام <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-symbol"
                    type="text"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value })
                    }
                    disabled={!!editingStock}
                    placeholder="مثلاً: فملی"
                    className={`
                      w-full h-10 rounded-xl border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      disabled:opacity-60 disabled:cursor-not-allowed
                      ${formErrors.symbol ? "border-red-500" : "border-border"}
                    `}
                  />
                  {formErrors.symbol && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {formErrors.symbol}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="field-name"
                    className="text-sm font-medium text-foreground"
                  >
                    نام شرکت <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثلاً: فولاد مبارکه اصفهان"
                    className={`
                      w-full h-10 rounded-xl border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.name ? "border-red-500" : "border-border"}
                    `}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Sector */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="field-sector"
                    className="text-sm font-medium text-foreground"
                  >
                    صنف <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="field-sector"
                    type="text"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                    placeholder="مثلاً: فلزات اساسی"
                    className={`
                      w-full h-10 rounded-xl border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.sector ? "border-red-500" : "border-border"}
                    `}
                  />
                  {formErrors.sector && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {formErrors.sector}
                    </p>
                  )}
                </div>

                {/* ISIN */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="field-isin"
                    className="text-sm font-medium text-foreground"
                  >
                    ISIN
                  </label>
                  <input
                    id="field-isin"
                    type="text"
                    value={formData.isin}
                    onChange={(e) =>
                      setFormData({ ...formData, isin: e.target.value })
                    }
                    placeholder="کد ISIN"
                    className="
                      w-full h-10 rounded-xl border border-border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    "
                  />
                </div>

                {/* Shares */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label
                    htmlFor="field-shares"
                    className="text-sm font-medium text-foreground"
                  >
                    تعداد سهام (میلیون)
                  </label>
                  <input
                    id="field-shares"
                    type="number"
                    min="0"
                    value={formData.shares_outstanding}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shares_outstanding: e.target.value,
                      })
                    }
                    placeholder="مثلاً: ۶۴۰۰"
                    className={`
                      w-full h-10 rounded-xl border bg-background px-3 text-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${formErrors.shares_outstanding
                        ? "border-red-500"
                        : "border-border"
                      }
                    `}
                  />
                  {formErrors.shares_outstanding && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {formErrors.shares_outstanding}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                انصراف
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="ml-2 animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={16} className="ml-2" />
                    {editingStock ? "ذخیره تغییرات" : "افزودن سهم"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Delete Confirmation Modal ───────────── */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setStockToDelete(null)}
          />

          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="delete-title"
                  className="text-lg font-semibold text-foreground"
                >
                  حذف سهم
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  آیا از حذف سهم{" "}
                  <span className="font-semibold text-foreground">
                    {stockToDelete.symbol}
                  </span>{" "}
                  ({stockToDelete.name}) اطمینان دارید؟ این عمل قابل بازگشت نیست.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setStockToDelete(null)}
                disabled={isDeleting}
              >
                انصراف
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="ml-2 animate-spin" />
                    در حال حذف...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="ml-2" />
                    حذف سهم
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── Toasts ───────────── */}
      <div className="fixed bottom-4 left-4 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`
              flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg
              animate-in slide-in-from-bottom-2 fade-in duration-200
              ${toast.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
              }
            `}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="بستن"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}