// components/CustomerList/index.tsx (کامپوننت اصلی بازسازی شده)
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Send, X } from "lucide-react";
import { ClientList } from "./components/ClientList";
import { HeaderSection } from "./components/HeaderSection";
import Footer from "../components/Footer/Footer";
import { AddClientModal } from "./components/AddClientModal";
import { BulkSmsModal } from "./components/BulkSmsModal";

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
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [userSmsBalance, setUserSmsBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const fetchClients = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/client/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setClients(data.clients);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
      toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>خطا در دریافت اطلاعات مشتریان</span>
        </div>
      ));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSmsBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const res = await fetch("/api/client/dashboard");
      const data = await res.json();
      const total =
        data.user?.total_sms_balance ||
        (data.user?.sms_balance || 0) + (data.user?.purchased_sms_credit || 0);
      setUserSmsBalance(total);
    } catch (e) {
      setUserSmsBalance(0);
      console.error("Error fetching SMS balance:", e);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchClients(1, searchQuery);
    fetchUserSmsBalance();
  }, []);

  useEffect(() => {
    if (searchQuery === "") return;
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchClients(1, searchQuery);
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

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
        toast.custom((t) => (
          <div className="bg-emerald-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Send className="w-6 h-6" />
            <span>پیام‌ها با موفقیت ارسال شد</span>
          </div>
        ));
        setUserSmsBalance(result.newBalance || userSmsBalance - clientIds.length);
        fetchUserSmsBalance();
      } else {
        toast.custom((t) => (
          <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <X className="w-6 h-6" />
            <span>{result.message || "خطا در ارسال"}</span>
          </div>
        ));
      }
    } catch (e) {
      toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>خطا در ارتباط با سرور</span>
        </div>
      ));
    }
  };

  const refreshClients = () => {
    fetchClients(1, searchQuery);
    fetchUserSmsBalance();
  };

  const formatPhone = (phone: string) => {
    if (phone?.length === 11) return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    return phone;
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md mx-auto">
      <Toaster position="top-center" containerClassName="!top-0" />
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white">
        <HeaderSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userSmsBalance={userSmsBalance}
          isLoadingBalance={isLoadingBalance}
          onRefresh={refreshClients}
          onShowBulkSms={() => setShowBulkSmsModal(true)}
          onShowAddClient={() => setShowAddClientModal(true)}
          clientsCount={clients.length}
        />

        <div className="max-w-2xl mx-auto px-4 py-6">
          <ClientList
            clients={clients}
            loading={loading}
            searchQuery={searchQuery}
            pagination={{
              page: pagination.page,
              totalPages: pagination.totalPages,
            }}
            onPageChange={handlePageChange}
            formatPhone={formatPhone}
          />
        </div>
      </div>

      <Footer />

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSuccess={refreshClients}
      />

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