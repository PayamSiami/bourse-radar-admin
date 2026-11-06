"use client";

import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Trash2, Shield, UserX, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  city?: string;
  verified: boolean;
  is_admin: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    is_admin: '' as string | undefined,
    verified: '' as string | undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.is_admin !== undefined) {
        params.append('is_admin', filters.is_admin.toString());
      }
      if (filters.verified !== undefined) {
        params.append('verified', filters.verified.toString());
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت کاربران');
      }

      const result = await response.json();
      setUsers(result.data.users);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      alert('خطایی در بارگذاری کاربران رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: boolean) => {
    if (userId === user?.id) {
      alert('نمی‌توانید نقش مدیریت خود را تغییر دهید');
      return;
    }

    setIsUpdating(prev => new Set(prev).add(userId));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_admin: newRole }),
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی نقش');
      }

      await fetchUsers();
    } catch (error: any) {
      console.error('Failed to update role:', error);
      alert('خطایی در بروزرسانی نقش رخ داده است');
    } finally {
      setIsUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در حذف کاربر');
      }

      await fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      alert('خطایی در حذف کاربر رخ داده است');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
          <div className="space-x-2">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">مدیریت کاربران</h1>
        <div className="flex space-x-3 space-x-reverse">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجوی کاربر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600 w-64"
            />
          </div>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 space-x-reverse"
          >
            <Filter size={20} />
            <span>فیلترها</span>
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نقش مدیریت
              </label>
              <select
                value={filters.is_admin ?? ''}
                onChange={(e) => setFilters({ ...filters, is_admin: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-card dark:border-gray-600"
              >
                <option value="">همه</option>
                <option value="true">مدیر</option>
                <option value="false">کاربر عادی</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وضعیت تأیید
              </label>
              <select
                value={filters.verified ?? ''}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-card dark:border-gray-600"
              >
                <option value="">همه</option>
                <option value="true">تأیید شده</option>
                <option value="false">تأیید نشده</option>
              </select>
            </div>
            <div className="flex items-end space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  setFilters({ is_admin: undefined, verified: undefined });
                  setSearch('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                پاک کردن فیلترها
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">کاربر</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">اطلاعات تماس</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">نقش</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">تأیید</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">عضويت</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.displayName || user.username || user.email}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {user.phone && <div className="mb-1">{user.phone}</div>}
                    {user.city && <div className="text-gray-600 dark:text-gray-500">{user.city}</div>}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <div className="flex items-center space-x-2 space-x-reverse text-blue-600 dark:text-blue-400">
                        <Shield size={16} />
                        <span className="font-medium">مدیر سیستم</span>
                      </div>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">کاربر عادی</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <div className="flex items-center space-x-2 space-x-reverse text-green-600 dark:text-green-400">
                        <CheckCircle size={16} />
                        <span className="font-medium">تأیید شده</span>
                      </div>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400">تأیید نشده</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {user.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleUpdateRole(user.id, true)}
                            disabled={isUpdating.has(user.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50"
                            title="دادن نقش مدیریت"
                          >
                            <Shield size={20} />
                          </button>
                          {user.is_admin && (
                            <button
                              onClick={() => handleUpdateRole(user.id, false)}
                              disabled={isUpdating.has(user.id)}
                              className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                              title="حذف نقش مدیریت"
                            >
                              <UserX size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setUserToDelete(user.id);
                              setShowDeleteModal(true);
                            }}
                            disabled={isUpdating.has(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                            title="حذف کاربر"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">هیچ کاربری یافت نشد</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          نمایش {pagination.total} کاربر
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600"
          >
            قبلی
          </button>
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            صفحه {pagination.page} از {pagination.totalPages}
          </div>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-600"
          >
            بعدی
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">تأیید حذف کاربر</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.
            </p>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'در حال حذف...' : 'حذف کاربر'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
