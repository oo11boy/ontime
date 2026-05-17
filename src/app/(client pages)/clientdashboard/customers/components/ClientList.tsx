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
  onClientDelete?: (clientId: string) => void;
  formatPhone: (phone: string) => string;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  loading,
  searchQuery,
  pagination,
  onPageChange,
  onClientDelete,
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
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-gray-400 text-lg">
          {searchQuery ? "مشتری پیدا نشد" : "هنوز مشتری‌ای ثبت نشده"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          برای شروع، مشتری جدید اضافه کنید
        </p>
      </div>
    );
  }

  const handleDelete = (clientId: string) => {
    if (onClientDelete) {
      onClientDelete(clientId);
    }
  };

  return (
    <>
      <div className="space-y-3 pb-32">
        {clients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            formatPhone={formatPhone}
            onDelete={handleDelete}
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