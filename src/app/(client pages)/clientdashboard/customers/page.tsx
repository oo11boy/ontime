"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { ClientList } from "./components/ClientList";
import { HeaderSection } from "./components/HeaderSection";
import Footer from "../components/Footer/Footer";
import { AddClientModal } from "./components/AddClientModal";

import { useCustomers } from "@/hooks/useCustomers";
import { useSendBulkSms } from "@/hooks/useSendSms";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BulkSmsModal } from "../BulkSmsModal"; // آدرس را چک کنید که درست باشد

export default function CustomersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const queryClient = useQueryClient();
  const {
    data: customersData,
    isLoading,
    refetch,
  } = useCustomers(page, searchQuery);

  const { balance: userSmsBalance, isLoading: isLoadingBalance } = useSmsBalance();
  const { mutateAsync: sendBulkSms } = useSendBulkSms();

  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/client/settings");
      return res.json();
    },
  });

  const clients = customersData?.clients || [];
  const pagination = customersData?.pagination || { page: 1, totalPages: 1 };

  const handleUpdateBusinessName = async (newName: string) => {
    try {
      const response = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData?.user,
          business_name: newName,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update Error:", error);
      return false;
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleSendBulkSms = async (templateKey: string, ids: (string | number)[]) => {
    try {
      const recipients = ids
        .map((id) => {
          const client = clients.find((c: any) => c.id === id);
          return {
            phone: client?.phone || "",
            name: client?.name || "",
          };
        })
        .filter((r) => r.phone);

      if (recipients.length === 0) {
        toast.error("هیچ شماره تلفنی برای ارسال یافت نشد");
        return;
      }

      await sendBulkSms({
        recipients,
        templateKey,
        sms_type: "bulk_customers",
      });

      refetch();
    } catch (error: any) {
      console.error("SMS Send Error:", error);
      throw error; // اجازه دهید مودال خطا را مدیریت کند
    }
  };

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
      <Toaster position="top-center" containerClassName="!top-0" />
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933]">
        <HeaderSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userSmsBalance={userSmsBalance}
          isLoadingBalance={isLoadingBalance}
          onRefresh={() => refetch()}
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
            formatPhone={(p) => p}
          />
        </div>
      </div>

      <Footer />

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onSuccess={() => refetch()}
      />

      <BulkSmsModal
        isOpen={showBulkSmsModal}
        onClose={() => setShowBulkSmsModal(false)}
        title="ارسال همگانی به مشتریان"
        recipients={clients
          .filter((c: any) => !c.is_blocked)
          .map((c: any) => ({
            id: c.id,
            name: c.name,
            details: c.phone,
          }))}
        userSmsBalance={userSmsBalance}
        businessName={userData?.user?.business_name || null}
        onSend={handleSendBulkSms}
        onUpdateBusinessName={handleUpdateBusinessName}
      />
    </div>
  );
}