// components/CustomerList/ClientList.tsx
import { Loader2 } from "lucide-react";
import React from "react";
import { ClientCard } from "./ClientCard";
import { Pagination } from "./Pagination";

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  total_bookings: number;
  is_blocked: boolean;
  last_booking_date?: string;
}

interface ClientListProps {
  clients: Client[];
  loading: boolean;
  searchQuery: string;
  pagination: {
    page: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  formatPhone: (phone: string) => string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  searchQuery,
  pagination,
  onPageChange,
  formatPhone,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <p className="text-center text-gray-400 py-20 text-lg">
        {searchQuery ? "مشتری پیدا نشد" : "هنوز مشتری‌ای ثبت نشده"}
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3 pb-32">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            formatPhone={formatPhone}
          />
        ))}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
};