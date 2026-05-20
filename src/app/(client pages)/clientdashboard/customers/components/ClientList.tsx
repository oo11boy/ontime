// components/CustomerList/ClientList.tsx
import { Loader2, Users, UserPlus, Search } from "lucide-react";
import React from "react";
import { ClientCard } from "./ClientCard";
import { Pagination } from "./Pagination";
import { motion } from "framer-motion";

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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 dark:bg-emerald-500/20 animate-ping" />
        </div>
        <p className="mt-4 text-slate-500 dark:text-gray-400 text-sm font-medium">
          در حال بارگذاری مشتریان...
        </p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-16 px-4"
      >
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
          {searchQuery ? (
            <Search className="w-12 h-12 text-slate-400 dark:text-gray-600" />
          ) : (
            <Users className="w-12 h-12 text-slate-400 dark:text-gray-600" />
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {searchQuery ? "مشتری پیدا نشد" : "هنوز مشتری‌ای ثبت نشده"}
        </h3>
        
        <p className="text-slate-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
          {searchQuery 
            ? "با عبارت جستجوی دیگری امتحان کنید" 
            : "برای شروع، روی دکمه 'مشتری جدید' کلیک کنید"}
        </p>
        
        {!searchQuery && (
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              اولین مشتری خود را اضافه کنید
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  const handleDelete = (clientId: string) => {
    if (onClientDelete) {
      onClientDelete(clientId);
    }
  };

  return (
    <>
      {/* آمار تعداد مشتریان */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-full" />
          <span className="text-xs font-bold text-slate-500 dark:text-gray-400">
            تعداد کل مشتریان
          </span>
        </div>
        <div className="bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
            {clients.length} نفر
          </span>
        </div>
      </div>

      {/* لیست کارت‌ها */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
        className="space-y-3 pb-32"
      >
        {clients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <ClientCard
              client={client}
              formatPhone={formatPhone}
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* کامپوننت پیجینیشن با پشتیبانی از دارک مود */}
      <div className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pb-4 pointer-events-none">
        <div className="pointer-events-auto">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>
    </>
  );
};