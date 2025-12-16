"use client";
import React, { useState, useEffect } from "react";
import { Search, User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CustomersList() {
  const router = useRouter();
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

  const fetchClients = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
      });

      const response = await fetch(`/api/client/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setClients(data.clients);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // 💡 اصلاحیه: فقط یک useEffect برای مدیریت همزمان اولین بارگذاری و جستجو
  useEffect(() => {
    // پاک کردن تایم‌آوت قبلی برای جلوگیری از فراخوانی‌های متعدد
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // تنظیم تایم‌آوت جدید (Debounce)
    const timeout = setTimeout(() => {
      // این تابع هم برای اولین بارگذاری (searchQuery = "")
      // و هم برای جستجوها اجرا می‌شود.
      fetchClients(1, searchQuery);
    }, 500); // ۵۰۰ میلی‌ثانیه تأخیر برای جستجو

    setSearchTimeout(timeout);

    // تابع cleanup برای پاک کردن تایم‌آوت هنگام Unmount شدن کامپوننت یا رندر مجدد
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery]); // وابسته به تغییرات searchQuery

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchClients(newPage, searchQuery);
    }
  };

  const formatPhone = (phone: string) => {
    if (phone && phone.length === 11) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white">
        {/* هدر جستجو */}
        <div className="sticky top-0 z-50 bg-[#1a1e26]/90 backdrop-blur-xl border-b border-emerald-500/30">
          <div className="max-w-2xl mx-auto p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو نام یا شماره..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3.5 px-5 pr-12 bg-[#242933] rounded-xl border border-emerald-500/40 focus:border-emerald-400 focus:outline-none text-sm placeholder-gray-400 transition"
              />
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* لیست مشتریان */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3 pb-32">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <p className="text-center text-gray-400 py-20 text-lg">
              {searchQuery ? "مشتری پیدا نشد" : "هنوز مشتری‌ای ثبت نشده"}
            </p>
          ) : (
            <>
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`bg-gray-50/5 backdrop-blur-sm rounded-xl border p-4 hover:bg-gray-50/10 transition-all duration-300 group ${
                    client.is_blocked
                      ? "border-red-500/50"
                      : "border-emerald-500/20 hover:border-emerald-400/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* آواتار و اطلاعات */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          client.is_blocked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-linear-to-br from-emerald-400 to-emerald-600"
                        }`}
                      >
                        {client.name ? client.name[0] : "?"}
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-white group-hover:text-emerald-300 transition">
                          {client.name}
                          {client.is_blocked ? (
                            <span className="text-xs text-red-400 mr-2">
                              بلاک شده
                            </span>
                          ) : (
                            ""
                          )}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {formatPhone(client.phone)}
                        </p>
                        {client.last_booking_date && (
                          <p className="text-xs text-emerald-400 mt-1">
                            {client.total_bookings} نوبت
                          </p>
                        )}
                      </div>
                    </div>

                    {/* آخرین مراجعه + دکمه */}
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <p className="text-xs text-gray-500">آخرین مراجعه</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {client.lastVisit || "ندارد"}
                        </p>
                      </div>

                      <Link
                        href={`/clientdashboard/customers/profile/${encodeURIComponent(
                          client.phone
                        )}`}
                        className="bg-linear-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 rounded-lg text-white text-sm font-medium flex items-center gap-1.5 hover:from-emerald-600 hover:to-emerald-700 transition shadow-md cursor-pointer"
                      >
                        <User className="w-4 h-4 group-hover:-translate-x-1 transition" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-gray-300">
                    صفحه {pagination.page} از {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}