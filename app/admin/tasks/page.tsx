"use client";

import { useState, useEffect } from 'react';
import { CheckSquare as CheckList, Plus, Edit, Trash2, Search, Filter, AlertCircle, X, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Task {
  id: number;
  task_id: string;
  task_name: string;
  module: string;
  phase: number;
  priority: 'بالا' | 'متوسط' | 'پایین';
  status: 'Backlog' | 'در انتظار' | 'در حال اجرا' | 'تکمیل شده';
  dependency?: string;
  description: string;
  data_source?: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedTasks {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminTasksPage() {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    priority: '' as string,
    status: '' as string,
    phase: '' as string,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    task_id: '',
    task_name: '',
    module: '',
    phase: '',
    priority: '',
    status: 'Backlog',
    dependency: '',
    description: '',
    data_source: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTasks();
  }, [pagination.page, filters]);

  useEffect(() => {
    const filtered = tasks.filter(task => {
      const matchSearch = task.task_id.toLowerCase().includes(search.toLowerCase()) ||
        task.task_name.toLowerCase().includes(search.toLowerCase()) ||
        task.module.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchPriority = filters.priority === '' || task.priority === filters.priority;
      const matchStatus = filters.status === '' || task.status === filters.status;
      const matchPhase = filters.phase === '' || task.phase.toString() === filters.phase;
      return matchSearch && matchPriority && matchStatus && matchPhase;
    });
    setFilteredTasks(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pagination.pageSize),
    }));
  }, [tasks, search, filters]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      if (filters.phase) params.append('phase', filters.phase);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت تسک‌ها');
      }

      const result = await response.json();
      setTasks(result.data.tasks);
      setPagination({
        total: result.data.total,
        page: result.data.page,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
      });
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      alert('خطایی در بارگذاری تسک‌ها رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.task_id.trim()) {
      errors.task_id = 'شناسه تسک الزامی است';
    }
    if (!formData.task_name.trim()) {
      errors.task_name = 'نام تسک الزامی است';
    }
    if (!formData.module.trim()) {
      errors.module = 'ماژول الزامی است';
    }
    if (!formData.priority) {
      errors.priority = 'اولویت الزامی است';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      task_id: '',
      task_name: '',
      module: '',
      phase: '',
      priority: '',
      status: 'Backlog',
      dependency: '',
      description: '',
      data_source: '',
    });
    setFormErrors({});
  };

  const handleAddTask = async () => {
    if (!validateForm()) {
      alert('لطفاً فیلدهای مورد نیاز را تکمیل کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('خطا در افزودن تسک');
      }

      await fetchTasks();
      setIsAddModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to add task:', error);
      alert('خطایی در افزودن تسک رخ داده است: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    if (!validateForm()) {
      alert('لطفاً فیلدهای مورد نیاز را تکمیل کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی تسک');
      }

      await fetchTasks();
      setEditingTask(null);
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert('خطایی در بروزرسانی تسک رخ داده است: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingTask(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      task_id: task.task_id,
      task_name: task.task_name,
      module: task.module,
      phase: task.phase.toString(),
      priority: task.priority,
      status: task.status,
      dependency: task.dependency || '',
      description: task.description,
      data_source: task.data_source || '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${taskToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('خطا در حذف تسک');
      }

      await fetchTasks();
      setTaskToDelete(null);
      setIsAddModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      alert('خطایی در حذف تسک رخ داده است: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'بالا':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'متوسط':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'پایین':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Backlog':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'در انتظار':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'در حال اجرا':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'تکمیل شده':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demo
  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مدیریت تسک‌ها</h1>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="bg-card rounded-lg shadow overflow-hidden">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">مدیریت تسک‌ها</h1>
        <div className="flex space-x-3 space-x-reverse">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجو در تسک‌ها..."
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
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2 space-x-reverse"
          >
            <Plus size={20} />
            <span>افزودن تسک</span>
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اولویت
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-card dark:border-gray-600"
              >
                <option value="">همه اولویت‌ها</option>
                <option value="بالا">بالا</option>
                <option value="متوسط">متوسط</option>
                <option value="پایین">پایین</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وضعیت
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-card dark:border-gray-600"
              >
                <option value="">همه وضعیت‌ها</option>
                <option value="Backlog">Backlog</option>
                <option value="در انتظار">در انتظار</option>
                <option value="در حال اجرا">در حال اجرا</option>
                <option value="تکمیل شده">تکمیل شده</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                فاز
              </label>
              <select
                value={filters.phase}
                onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-card dark:border-gray-600"
              >
                <option value="">همه فازها</option>
                <option value="1">فاز 1</option>
                <option value="2">فاز 2</option>
              </select>
            </div>
            <div className="flex items-end space-x-2 space-x-reverse">
              <button
                onClick={() => {
                  setFilters({ priority: '', status: '', phase: '' });
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
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">شناسه</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">تسک</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">ماژول</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">فاز</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">اولویت</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">وضعیت</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">وابستگی</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">توضیح</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">منبع داده</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{task.task_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white">{task.task_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {task.module}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    فاز {task.phase}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {task.dependency && task.dependency.length > 10
                      ? task.dependency.substring(0, 10) + '...'
                      : task.dependency || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                    {task.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {task.data_source}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setTaskToDelete(task.id);
                          setIsAddModalOpen(true); // Use delete confirmation modal
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckList className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400">هیچ تسکی یافت نشد</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          نمایش {pagination.total} تسک
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

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg max-w-4xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <h3 className="text-xl font-bold">
                {editingTask ? 'ویرایش تسک' : 'افزودن تسک جدید'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    شناسه تسک *
                  </label>
                  <input
                    type="text"
                    value={formData.task_id}
                    onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
                    disabled={!!editingTask}
                    placeholder="مثلاً: T01"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  />
                  {formErrors.task_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.task_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    نام تسک *
                  </label>
                  <input
                    type="text"
                    value={formData.task_name}
                    onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  />
                  {formErrors.task_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.task_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ماژول *
                  </label>
                  <input
                    type="text"
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  />
                  {formErrors.module && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.module}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    فاز *
                  </label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  >
                    <option value="">انتخاب فاز</option>
                    <option value="1">فاز 1</option>
                    <option value="2">فاز 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اولویت *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  >
                    <option value="">انتخاب اولویت</option>
                    <option value="بالا">بالا</option>
                    <option value="متوسط">متوسط</option>
                    <option value="پایین">پایین</option>
                  </select>
                  {formErrors.priority && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.priority}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وضعیت
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="در انتظار">در انتظار</option>
                    <option value="در حال اجرا">در حال اجرا</option>
                    <option value="تکمیل شده">تکمیل شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    وابستگی
                  </label>
                  <input
                    type="text"
                    value={formData.dependency}
                    onChange={(e) => setFormData({ ...formData, dependency: e.target.value })}
                    placeholder="مثلاً: T04"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    منبع داده
                  </label>
                  <input
                    type="text"
                    value={formData.data_source}
                    onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                    placeholder="مثلاً: TSE, TJJU"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    توضیح/جزئیات
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="توضیحات کامل تسک..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600 min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end space-x-3 space-x-reverse sticky bottom-0 bg-card">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                انصراف
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
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
                    <span>{editingTask ? 'ذخیره تغییرات' : 'افزودن تسک'}</span>
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
