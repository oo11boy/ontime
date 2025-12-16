// src/app/(client pages)/clientdashboard/customers/page.tsx

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Search, User, Loader2, ChevronLeft, ChevronRight, MessageSquare, Send, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import Footer from "../components/Footer/Footer";

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  total_bookings: number;
  cancelled_count: number;
  is_blocked: boolean;
  last_booking_date: string;
  last_booking_time: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const BulkSmsModal = ({
  isOpen,
  onClose,
  clients,
  userSmsBalance,
  onSend,
}: {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  userSmsBalance: number;
  onSend: (message: string, clientIds: string[]) => Promise<void>;
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const activeClients = useMemo(() => clients.filter(c => !c.is_blocked), [clients]);

  useEffect(() => {
    if (isOpen && activeClients.length > 0) {
      setSelectedClients(activeClients.map(c => c.id));
    }
    if (!isOpen) {
      setSelectedClients([]);
      setMessage("");
    }
  }, [isOpen, activeClients]);

  const handleToggleAll = () => {
    if (selectedClients.length === activeClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(activeClients.map(c => c.id));
    }
  };

  const handleToggleClient = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) return toast.error("متن پیام را وارد کنید");
    if (selectedClients.length === 0) return toast.error("حداقل یک مشتری انتخاب کنید");
    if (selectedClients.length > userSmsBalance) {
      return toast.error(`موجودی کافی نیست (${selectedClients.length} > ${userSmsBalance})`);
    }

    setIsSending(true);
    try {
      await onSend(message, selectedClients);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1a1e26] to-[#242933] rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold text-white">پیام همگانی به مشتریان</h3>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5 mx-auto" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-300">انتخاب شده</span>
              <span className="text-emerald-300 font-bold">{selectedClients.length} نفر</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">هزینه</span>
              <span className={selectedClients.length > userSmsBalance ? "text-red-400 font-bold" : "text-emerald-300 font-bold"}>
                {selectedClients.length} پیامک
              </span>
            </div>
            {selectedClients.length > userSmsBalance && (
              <p className="text-xs text-red-400 mt-2">❌ موجودی کافی نیست</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-3 block">
              متن پیام <span className="text-xs text-gray-500">(می‌توانید از {`{client_name}`} استفاده کنید)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="سلام {client_name} عزیز، تخفیف ویژه این هفته برای شما..."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-40"
            />
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm text-gray-300">مشتریان</label>
              <button onClick={handleToggleAll} className="text-xs text-emerald-400 hover:text-emerald-300">
                {selectedClients.length === activeClients.length ? "عدم انتخاب همه" : "انتخاب همه"}
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {activeClients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => handleToggleClient(client.id)}
                      className="w-5 h-5 text-emerald-500 rounded"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-gray-400">{client.phone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{client.total_bookings} نوبت</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl"
          >
            انصراف
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || selectedClients.length === 0 || selectedClients.length > userSmsBalance}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" /> در حال ارسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> ارسال پیام
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [userSmsBalance, setUserSmsBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const fetchClients = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", ...(search && { search }) });
      const res = await fetch(`/api/client/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSmsBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const res = await fetch("/api/client/dashboard");
      const data = await res.json();
      const total = data.user?.total_sms_balance || (data.user?.sms_balance || 0) + (data.user?.purchased_sms_credit || 0);
      setUserSmsBalance(total);
    } catch (e) {
      setUserSmsBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => fetchClients(1, searchQuery), 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchClients();
    fetchUserSmsBalance();
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClients(newPage, searchQuery);
    }
  };

  const handleSendBulkSms = async (message: string, clientIds: string[]) => {
    try {
      const res = await fetch("/api/bulk-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientIds, message }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(`ارسال شد برای ${clientIds.length} نفر`);
        setUserSmsBalance(result.newBalance || userSmsBalance - clientIds.length);
        fetchUserSmsBalance(); // رفرش موجودی
      } else {
        toast.error(result.message || "خطا در ارسال");
      }
    } catch (e) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const formatPhone = (phone: string) => {
    if (phone?.length === 11) return `${phone.slice(0,4)} ${phone.slice(4,7)} ${phone.slice(7)}`;
    return phone;
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-[#1a1e26] to-[#242933] text-white">
        {/* هدر */}
        <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
          <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <User className="w-7 h-7 text-emerald-400" />
                مشتریان
              </h1>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" />
                  موجودی: {isLoadingBalance ? '...' : `${userSmsBalance} پیامک`}
                </div>
                <button
                  onClick={() => {
                    fetchClients();
                    fetchUserSmsBalance();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="جستجو نام یا شماره..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full py-3.5 px-5 pr-12 bg-[#242933] rounded-xl border border-emerald-500/40 focus:border-emerald-400 text-sm"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
            </div>

            <button
              onClick={() => setShowBulkSmsModal(true)}
              disabled={clients.length === 0}
              className="mt-3 w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageSquare className="w-5 h-5" />
              پیام همگانی به همه
            </button>
          </div>
        </div>

        {/* لیست */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3 pb-32">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
          ) : clients.length === 0 ? (
            <p className="text-center text-gray-400 py-20 text-lg">
              {searchQuery ? "مشتری پیدا نشد" : "هنوز مشتری‌ای ثبت نشده"}
            </p>
          ) : (
            <>
              {clients.map(client => (
                <div
                  key={client.id}
                  className={`bg-gray-50/5 backdrop-blur-sm rounded-xl border p-4 hover:bg-gray-50/10 transition-all ${
                    client.is_blocked ? "border-red-500/50" : "border-emerald-500/20 hover:border-emerald-400/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        client.is_blocked ? "bg-red-500/20 text-red-400" : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                      }`}>
                        {client.name ? client.name[0] : "?"}
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-white">
                          {client.name}
                          {client.is_blocked ? <span className="text-xs text-red-400 mr-2">بلاک شده</span>:""}
                        </h3>
                        <p className="text-xs text-gray-400">{formatPhone(client.phone)}</p>
                        {client.last_booking_date && (
                          <p className="text-xs text-emerald-400 mt-1">{client.total_bookings} نوبت</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">آخرین مراجعه</p>
                        <p className="text-sm font-bold text-emerald-400">{client.lastVisit || "ندارد"}</p>
                      </div>
                      <Link
                        href={`/clientdashboard/customers/profile/${encodeURIComponent(client.phone)}`}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg bg-white/10 disabled:opacity-30">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-300">صفحه {pagination.page} از {pagination.totalPages}</span>
                  <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg bg-white/10 disabled:opacity-30">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />

      <BulkSmsModal
        isOpen={showBulkSmsModal}
        onClose={() => setShowBulkSmsModal(false)}
        clients={clients}
        userSmsBalance={userSmsBalance}
        onSend={handleSendBulkSms}
      />
    </div>
  );
}