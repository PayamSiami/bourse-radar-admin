"use client";

import { useState, useEffect } from 'react';
import { FolderGit2, Plus, Edit, Trash2, Search, X, Save, X as XIcon, TrendingUp, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Stock {
  symbol: string;
  name: string;
  sector: string;
  isin?: string;
  shares_outstanding?: number;
  lastUpdated?: string;
}

export default function AdminStocksPage() {
  const { user, token } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [bulkImportData, setBulkImportData] = useState<{ files: Stock[]; errors: string[] }>({
    files: [],
    errors: [],
  });

  // Form states
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    sector: '',
    isin: '',
    shares_outstanding: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered = stocks.filter(stock => {
      const matchName = stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        stock.sector.toLowerCase().includes(search.toLowerCase());
      return matchName;
    });
    setFilteredStocks(filtered);
  }, [stocks, search]);

  const fetchStocks = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت سهام');
      }

      const result = await response.json();
      const stocksList = result.data || result.stocks || [];
      setStocks(stocksList);
      setFilteredStocks(stocksList);
    } catch (error: any) {
      console.error('Failed to fetch stocks:', error);
      alert('خطایی در بارگذاری سهام رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  // Since /api/admin/stocks/:symbol is a PUT endpoint for partial updates but we want all stocks, I'll use stock info from another endpoint
  // Let's fetch from /api/stocks (which returns all stocks) and use for admin management
  // Alternatively, we could add a GET endpoint for admin to fetch all stocks with edit permission

  const handleAddStock = async () => {
    if (!validateForm()) {
      alert('لطفاً فیلدهای مورد نیاز را تکمیل کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      // We'll need a POST endpoint for creating stocks, but for now let's show an error message
      alert('عملیات افزودن سهام نیاز به backend endpoint جدید دارد');
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Failed to add stock:', error);
      alert('خطایی در افزودن سهام رخ داده است');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stocks/${editingStock.symbol}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در بروزرسانی سهام');
      }

      await fetchStocks();
      setEditingStock(null);
    } catch (error: any) {
      console.error('Failed to update stock:', error);
      alert('خطایی در بروزرسانی سهام رخ داده است: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (stock: Stock) => {
    const confirmDelete = window.confirm(`آیا از حذف سهام ${stock.symbol} اطمینان دارید؟`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/stocks/${stock.symbol}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('خطا در حذف سهام');
      }

      await fetchStocks();
    } catch (error: any) {
      console.error('Failed to delete stock:', error);
      alert('خطایی در حذف سهام رخ داده است: ' + error.message);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      errors.symbol = 'نماد سهام الزامی است';
    }
    if (!formData.name.trim()) {
      errors.name = 'نام سهام الزامی است';
    }
    if (!formData.sector.trim()) {
      errors.sector = 'صنف سهام الزامی است';
    }
    if (formData.shares_outstanding && isNaN(Number(formData.shares_outstanding))) {
      errors.shares_outstanding = 'تعداد سهام باید یک عدد معتبر باشد';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      sector: '',
      isin: '',
      shares_outstanding: '',
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      isin: stock.isin || '',
      shares_outstanding: stock.shares_outstanding?.toString() || '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return ' accesible ';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const getSectorColor = (sector: string) => {
    const sectorLower = sector.toLowerCase();
    if (sectorLower.includes('فلز')) return 'text-emerald-600 dark:text-emerald-400';
    if (sectorLower.includes('شیمیایی')) return 'text-blue-600 dark:text-blue-400';
    if (sectorLower.includes('خودروسازی')) return 'text-red-600 dark:text-red-400';
    if (sectorLower.includes('بانک')) return 'text-green-600 dark:text-green-400';
    if (sectorLower.includes('سرمایه‌گذاری')) return 'text-purple-600 dark:text-purple-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مدیریت سهام</h1>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">مدیریت سهام</h1>
        <div className="flex space-x-3 space-x-reverse">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجوی سهم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600 w-64"
            />
          </div>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 space-x-reverse"
          >
            <Plus size={20} />
            <span>اضافه کردن سهم</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div>
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">نماد</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">نام</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">صنف</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">آی‌اس‌آین</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">تعداد سهام</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">آخرین بروزرسانی</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FolderGit2 className="text-blue-600 dark:text-blue-400" size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">کدال: {stock.isin || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">{stock.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${getSectorColor(stock.sector)}`}>
                      {stock.sector}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {stock.isin || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {stock.shares_outstanding
                      ? new Intl.NumberFormat('fa-IR').format(stock.shares_outstanding)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(stock.lastUpdated)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => openEditModal(stock)}
                        className="px-3 py-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Edit size={16} className="inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteStock(stock)}
                        className="px-3 py-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 size={16} className="inline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <FolderGit2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">هیچ سهمی یافت نشد</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-2xl mx-4 w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingStock ? 'ویرایش سهم' : 'افزودن سهم جدید'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStock(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نماد سهام *
                  </label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    disabled={!!editingStock}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                    placeholder="مثلاً: فملی"
                  />
                  {formErrors.symbol && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.symbol}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام شرکت *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!!editingStock}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                    placeholder="مثلاً: فولاد مبارکه اصفهان"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    صنف *
                  </label>
                  <input
                    type="text"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                    placeholder="مثلاً: فلزات اساسی"
                  />
                  {formErrors.sector && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.sector}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    آی‌اس‌آین (ISIN)
                  </label>
                  <input
                    type="text"
                    value={formData.isin}
                    onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                    placeholder="کد ISIN شرکت"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    تعداد سهام (میلیون)
                  </label>
                  <input
                    type="number"
                    value={formData.shares_outstanding}
                    onChange={(e) => setFormData({ ...formData, shares_outstanding: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                    placeholder="مثلاً: 6400"
                  />
                  {formErrors.shares_outstanding && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.shares_outstanding}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStock(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                انصراف
              </button>
              <button
                onClick={editingStock ? handleUpdateStock : handleAddStock}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{editingStock ? 'ذخیره تغییرات' : 'افزودن سهم'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
