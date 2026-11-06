"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Filter, Search, X, CheckCircle, Clock, FileText, Reply } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Ticket {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  last_message: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedTickets {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminTicketsPage() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 0,
    total: 0,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '' as string,
    userId: undefined as number | undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, filters]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages();
    }
  }, [selectedTicket, pagination.page]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.userId) {
        params.append('userId', filters.userId.toString());
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در دریافت تیکت‌ها');
      }

      const result = await response.json();
      setTickets(result.data.tickets);
      setPagination({
        total: result.data.total,
        page: result.data.page,
        pageSize: result.data.pageSize,
        totalPages: result.data.totalPages,
      });
    } catch (error: any) {
      console.error('Failed to fetch tickets:', error);
      alert('خطایی در بارگذاری تیکت‌ها رخ داده است');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedTicket) return;

    setIsFetchingMessages(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tickets/${selectedTicket.id}/messages?page=1&pageSize=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('خطا در دریافت پیام‌ها');
      }

      const result = await response.json();
      setMessages(result.data);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      alert('خطایی در بارگذاری پیام‌ها رخ داده است');
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tickets/${ticketId}/status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('خطا در بروزرسانی وضعیت');
      }

      await fetchTickets();
      if (selectedTicket) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert('خطایی در بروزرسانی وضعیت رخ داده است');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setIsUpdating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tickets/${selectedTicket.id}/message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (!response.ok) {
        throw new Error('خطا در ارسال پیام');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (error: any) {
      console.error('Failed to add message:', error);
      alert('خطایی در ارسال پیام رخ داده است');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return { label: 'باز', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' };
      case 'pending':
        return { label: 'در انتظار', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
      case 'resolved':
        return { label: 'حل‌شده', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' };
      case 'closed':
        return { label: 'بسته شده', color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-900/20' };
      default:
        return { label: status, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">مدیریت تیکت‌ها</h1>
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
        <h1 className="text-3xl font-bold">مدیریت تیکت‌ها</h1>
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="جستجو در تیکت‌ها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 pl-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-card dark:border-gray-600 w-64"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-card dark:border-gray-600"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="open">باز</option>
            <option value="pending">در انتظار</option>
            <option value="resolved">حل‌شده</option>
            <option value="closed">بسته شده</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* Tickets List Panel */}
        <div className="bg-card rounded-lg shadow overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2 space-x-reverse">
                <MessageSquare size={20} />
                <span>لیست تیکت‌ها</span>
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">{pagination.total} تیکت</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tickets.map((ticket) => {
              const statusInfo = getStatusLabel(ticket.status);
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`
                    p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50
                    ${selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-r-4 border-transparent'}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{ticket.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {ticket.user_name} - {ticket.user_email}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-2 space-x-reverse">
                    {ticket.last_message && (
                      <>
                        <span className="truncate max-w-[200px]">{ticket.last_message}</span>
                      </>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-400 dark:text-gray-500">
                    <Clock size={12} className="ml-2" />
                    <span>{formatDate(ticket.updated_at)}</span>
                  </div>
                </div>
              );
            })}

            {tickets.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 dark:text-gray-400">هیچ تیکی یافت نشد</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                صفحه {pagination.page} از {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="bg-card rounded-lg shadow overflow-hidden flex flex-col h-full">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTicket.title}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusLabel(selectedTicket.status).bg} ${getStatusLabel(selectedTicket.status).color}`}>
                        {getStatusLabel(selectedTicket.status).label}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-3 space-x-reverse">
                      <span>{selectedTicket.user_name}</span>
                      <span>·</span>
                      <span>{selectedTicket.user_email}</span>
                      <span>·</span>
                      <span>ایجاد شده در {formatDate(selectedTicket.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">توضیحات:</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedTicket.description}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <h4 className="font-semibold mb-4 flex items-center space-x-2 space-x-reverse">
                  <Reply size={20} />
                  <span>پیام‌ها</span>
                </h4>

                {/* Messages List */}
                <div className="space-y-4 mb-6">
                  {messages.map((message, index) => {
                    const isAdmin = message.is_admin;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-3xl ${isAdmin ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'} px-4 py-3 rounded-lg`}>
                          <div className="flex items-center space-x-2 space-x-reverse text-sm mb-2">
                            <span className="font-medium">{message.user_name}</span>
                            {isAdmin ? (
                              <Shield className="text-blue-100" size={16} />
                            ) : (
                              <span className="text-gray-400">کاربر</span>
                            )}
                            <span className="text-xs opacity-70">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Message */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">پاسخ دادن</h4>
                  <div className="space-y-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="پاسخ خود را بنویسید..."
                      className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 min-h-[120px] resize-none"
                    />
                    <div className="flex space-x-3 space-x-reverse">
                      <button
                        onClick={handleAddMessage}
                        disabled={isUpdating || !newMessage.trim()}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        {isUpdating ? 'در حال ارسال...' : 'ارسال پاسخ'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 dark:bg-gray-800">
                <h4 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">تغییر وضعیت تیکت</h4>
                <div className="flex space-x-3 space-x-reverse">
                  {['open', 'pending', 'resolved', 'closed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedTicket.id, status)}
                      disabled={isUpdating || selectedTicket.status === status}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium
                        ${selectedTicket.status === status
                          ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                          : 'border hover:bg-gray-50 dark:hover:bg-gray-700'}
                      `}
                    >
                      {getStatusLabel(status).label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-600">
                <FileText className="mx-auto mb-4" size={64} />
                <p className="text-lg">یک تیکت را برای مشاهده جزئیات انتخاب کنید</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for admin badge
function Shield({ className, size }: { className?: string; size?: number }) {
  // Local Shield icon implementation since we already import it
  return <Shield className={className} size={size} />;
}
