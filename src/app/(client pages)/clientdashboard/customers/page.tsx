// src/app/(client pages)/clientdashboard/customers/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Send, X } from "lucide-react";
import { ClientList } from "./components/ClientList";
import { HeaderSection } from "./components/HeaderSection";
import Footer from "../components/Footer/Footer";
import { AddClientModal } from "./components/AddClientModal";
import { BulkSmsModal } from "./components/BulkSmsModal";
import { useCustomers } from "@/hooks/useCustomers";

import { useSendBulkSms } from "@/hooks/useSendSms"; // هوک جدید برای ارسال گروهی
import { useSmsBalance } from "@/hooks/useSmsBalance";

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

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  
  const { data: customersData, isLoading, refetch } = useCustomers(page, searchQuery);
  const { balance: userSmsBalance, isLoading: isLoadingBalance } = useSmsBalance();
  
  // هوک جدید برای ارسال پیامک گروهی (از طریق API متمرکز)
  const { mutate: sendBulkSms } = useSendBulkSms();
  
  const clients = customersData?.clients || [];
  const pagination = customersData?.pagination || { page: 1, totalPages: 1 };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleSendBulkSms = (message: string, clientIds: string[]) => {
    try {
      // آماده‌سازی recipients برای هوک متمرکز
      const recipients = clientIds.map((id) => {
        const client = clients.find((c) => c.id === id);
        return {
          phone: client?.phone || "",
          name: client?.name || "",
        };
      }).filter((r) => r.phone); // فیلتر موارد نامعتبر

      if (recipients.length === 0) {
        toast.error("هیچ شماره تلفنی برای ارسال یافت نشد");
        return;
      }

      // ارسال با هوک متمرکز
      sendBulkSms({
        recipients,
        message,
        sms_type: "bulk_customers",
      });

      // به‌روزرسانی لیست مشتریان پس از موفقیت (اختیاری)
      refetch();
    } catch (error: any) {
      console.error("Error sending bulk SMS:", error);
      toast.custom((t) => (
        <div className="bg-red-600/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <X className="w-6 h-6" />
          <span>{error.message || "خطا در ارتباط با سرور"}</span>
        </div>
      ));
    }
  };

  const refreshClients = () => {
    refetch();
  };

  const formatPhone = (phone: string) => {
    if (phone?.length === 11) return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    return phone;
  };

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
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
            loading={isLoading}
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
      {/* <BulkSmsModal 
        isOpen={showBulkSmsModal} 
        onClose={() => setShowBulkSmsModal(false)}
        clients={clients} 
        userSmsBalance={userSmsBalance} 
        onSend={handleSendBulkSms} 
      /> */}
    </div>
  );
}