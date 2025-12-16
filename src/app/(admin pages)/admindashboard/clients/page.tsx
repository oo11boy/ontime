"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  Edit2,
  Phone,
  Users,
  MessageSquare,
  Crown,
  AlertCircle,
  Briefcase,
  Calendar,
  Filter,
  X,
  Check,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

type Client = {
  id: number;
  businessName: string;
  phone: string;
  plan: string;
  totalRemainingSms: number;
  planBalance: number;
  purchasedPackagesBalance: number;
  customerCount: number;
  status: "active" | "expired";
  jobTitle: string;
  registrationDate: string;
  hasCompleteProfile: boolean;
};

type FilterType = "all" | "complete" | "incomplete";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState({ total: 0, complete: 0, incomplete: 0 });
  
  // حالت‌های ویرایش
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    job_id: "",
  });
  
  // لیست مشاغل برای دراپ‌دان
  const [jobs, setJobs] = useState<{ id: number; persian_name: string }[]>([]);

  // Debounce برای جستجو
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // بارگذاری اولیه
  useEffect(() => {
    fetchClients();
    fetchJobs();
  }, []);

  // بارگذاری خودکار با تغییر فیلتر یا جستجو
  useEffect(() => {
    fetchClients();
  }, [debouncedSearchQuery, selectedFilter]);

  // بارگذاری مشاغل
  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // بارگذاری کلاینت‌ها
  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/admin/clients", window.location.origin);
      if (debouncedSearchQuery) url.searchParams.set("search", debouncedSearchQuery);
      if (selectedFilter !== "all") url.searchParams.set("filter", selectedFilter);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      
      if (data.success) {
        setClients(data.clients);
        setStats(data.stats || { total: 0, complete: 0, incomplete: 0 });
      } else {
        toast.error(data.message || "خطا در دریافت لیست");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  // حذف کاربر
  const handleDelete = async (client: Client) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید "${client.businessName}" را حذف کنید؟\n\nتمام اطلاعات مرتبط (نوبت‌ها، مشتریان، پیامک‌ها) نیز حذف خواهند شد.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(`"${client.businessName}" با موفقیت حذف شد`);
        fetchClients();
      } else {
        toast.error(data.message || "خطا در حذف کاربر");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // شروع ویرایش
  const startEdit = (client: Client) => {
    setEditingClient(client);
    
    // پیدا کردن job_id بر اساس jobTitle
    const job = jobs.find(j => j.persian_name === client.jobTitle);
    
    setEditForm({
      name: client.businessName === 'ثبت‌نام ناقص' ? '' : client.businessName,
      phone: client.phone,
      job_id: job?.id.toString() || "",
    });
  };

  // ذخیره ویرایش
  const handleSaveEdit = async () => {
    if (!editingClient) return;

    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingClient.id,
          name: editForm.name,
          phone: editForm.phone,
          job_id: editForm.job_id ? parseInt(editForm.job_id) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("اطلاعات کاربر با موفقیت به‌روزرسانی شد");
        setEditingClient(null);
        setEditForm({ name: "", phone: "", job_id: "" });
        fetchClients();
      } else {
        toast.error(data.message || "خطا در به‌روزرسانی اطلاعات");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  // فرمت اعداد
  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      {/* هدر */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-emerald-400 w-7 h-7" />
            مدیریت کلاینت‌ها
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت لیست کسب‌وکارهای ثبت شده در سیستم
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchClients}
            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition"
            title="بروزرسانی لیست"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* آمار و فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">کل کسب‌وکارها</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-10 h-10 text-emerald-400/40" />
          </div>
        </div>
        
        <div 
          className={`bg-[#242933] border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
            selectedFilter === "complete" 
              ? "border-emerald-500 bg-emerald-500/10" 
              : "border-emerald-500/20"
          }`}
          onClick={() => setSelectedFilter("complete")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">ثبت‌نام کامل</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.complete}</p>
            </div>
            <Check className="w-10 h-10 text-emerald-400/40" />
          </div>
        </div>
        
        <div 
          className={`bg-[#242933] border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
            selectedFilter === "incomplete" 
              ? "border-amber-500 bg-amber-500/10" 
              : "border-amber-500/20"
          }`}
          onClick={() => setSelectedFilter("incomplete")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">ثبت‌نام ناقص</p>
              <p className="text-2xl font-bold text-amber-400">{stats.incomplete}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-amber-400/40" />
          </div>
        </div>
        
        <div 
          className={`bg-[#242933] border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${
            selectedFilter === "all" 
              ? "border-blue-500 bg-blue-500/10" 
              : "border-blue-500/20"
          }`}
          onClick={() => setSelectedFilter("all")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">همه</p>
              <p className="text-2xl font-bold text-blue-400">نمایش همه</p>
            </div>
            <Filter className="w-10 h-10 text-blue-400/40" />
          </div>
        </div>
      </div>

      {/* نوار جستجو */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="جستجو نام کسب‌وکار، شماره یا شغل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242933] border border-emerald-500/30 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-emerald-400 transition"
          />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedFilter("all");
            }}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition"
          >
            پاک کردن
          </button>
        </div>
      </div>

      {/* مودال ویرایش */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
              <h3 className="text-xl font-bold text-white">ویرایش کاربر</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">نام کسب‌وکار</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="نام کسب‌وکار را وارد کنید"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">شماره تماس</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500"
                  placeholder="مثال: 09123456789"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-2">شغل</label>
                <select
                  value={editForm.job_id}
                  onChange={(e) => setEditForm({...editForm, job_id: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">انتخاب شغل</option>
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.persian_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition"
                >
                  ذخیره تغییرات
                </button>
                <button
                  onClick={() => setEditingClient(null)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* جدول */}
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
            <p className="mt-2 text-gray-400">در حال دریافت اطلاعات...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {selectedFilter === "complete" ? "هیچ کاربر با ثبت‌نام کامل یافت نشد" :
             selectedFilter === "incomplete" ? "هیچ کاربر با ثبت‌نام ناقص یافت نشد" :
             "هنوز کلاینتی ثبت نشده است"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-[#1a1e26]/50 text-gray-400 text-xs uppercase border-b border-emerald-500/10">
                  <tr>
                    <th className="px-6 py-4 font-medium">کسب‌وکار</th>
                    <th className="px-6 py-4 font-medium">اطلاعات تماس</th>
                    <th className="px-6 py-4 font-medium text-center">پلن</th>
                    <th className="px-6 py-4 font-medium text-center">پیامک باقیمانده</th>
                    <th className="px-6 py-4 font-medium text-center">مشتریان</th>
                    <th className="px-6 py-4 font-medium text-center">وضعیت</th>
                    <th className="px-6 py-4 font-medium text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-500/10 text-sm">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                      {/* ستون کسب‌وکار */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner ${
                            !client.hasCompleteProfile 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 text-emerald-400'
                          }`}>
                            {client.businessName[0] || "?"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white group-hover:text-emerald-300 transition">
                                {client.businessName}
                              </p>
                              {!client.hasCompleteProfile && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  <AlertCircle className="w-3 h-3" />
                                  ثبت‌نام ناقص
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                              <Briefcase className="w-3 h-3" />
                              {client.jobTitle}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {formatDate(client.registrationDate)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ستون اطلاعات تماس */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-300 font-mono text-sm">
                          <Phone className="w-3 h-3 text-emerald-500/50" />
                          {client.phone}
                        </div>
                        {!client.hasCompleteProfile && (
                          <div className="mt-2 text-xs text-amber-400/80">
                            <span className="font-medium">نیازمند تکمیل:</span>
                            <ul className="mt-1 space-y-1">
                              {client.businessName === 'ثبت‌نام ناقص' && <li>• نام کسب‌وکار</li>}
                              {client.jobTitle === 'نامشخص' && <li>• انتخاب شغل</li>}
                            </ul>
                          </div>
                        )}
                      </td>

                      {/* ستون پلن */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                            client.plan === "طلایی"
                              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                              : client.plan === "پلن پایه"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          <Crown className="w-3 h-3" />
                          {client.plan}
                        </span>
                      </td>

                      {/* ستون پیامک باقیمانده */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className={`text-2xl font-bold ${
                            client.totalRemainingSms < 20 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {formatNumber(client.totalRemainingSms)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 w-32 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  client.totalRemainingSms < 20 
                                    ? 'bg-linear-to-r from-red-500 to-red-400'
                                    : 'bg-linear-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, (client.totalRemainingSms / 1000) * 100)}%` 
                                }}
                              />
                            </div>
                            <MessageSquare className="w-4 h-4 text-blue-400/70" />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <div className="flex gap-4">
                              <span>پلن: {formatNumber(client.planBalance)}</span>
                              <span>بسته‌ها: {formatNumber(client.purchasedPackagesBalance)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ستون مشتریان */}
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-300 bg-[#1a1e26] px-4 py-2.5 rounded-xl border border-emerald-500/10">
                          <Users className="w-4 h-4 text-emerald-500/50" />
                          <span className="font-bold text-xl">{formatNumber(client.customerCount)}</span>
                        </div>
                      </td>

                      {/* ستون وضعیت */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              client.status === "active"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {client.status === "active" ? "فعال" : "منقضی"}
                          </span>
                        </div>
                      </td>

                      {/* ستون عملیات */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => startEdit(client)}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                            title="ویرایش"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="text-xs">ویرایش</span>
                          </button>
                          
                          <button
                            onClick={() => handleDelete(client)}
                            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">حذف</span>
                          </button>
                          
                          {!client.hasCompleteProfile && (
                            <button
                              onClick={() => startEdit(client)}
                              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition"
                              title="تکمیل ثبت‌نام"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span className="text-xs">تکمیل</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* فوتر جدول */}
            <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-emerald-500/10 bg-[#1a1e26]/50">
              <div className="text-sm text-gray-400 mb-2 md:mb-0">
                نمایش {clients.length} از {stats.total} کسب‌وکار
                {selectedFilter !== "all" && ` (فیلتر: ${selectedFilter === "complete" ? "ثبت‌نام کامل" : "ثبت‌نام ناقص"})`}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500"></div>
                  <span className="text-xs text-gray-400">فعال</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"></div>
                  <span className="text-xs text-gray-400">منقضی</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500"></div>
                  <span className="text-xs text-gray-400">ثبت‌نام ناقص</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}