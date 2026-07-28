"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Phone,
  PhoneCall,
  PhoneOff,
  User,
  Briefcase,
  Wallet,
  MessageSquare,
  CalendarDays,
  MoreVertical,
  Save,
  X,
  Bell,
  ChevronDown,
  ListFilter,
  CalendarClock,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================================
// تایپ‌ها
// ============================================================
interface User {
  id: number;
  name: string;
  phone: string;
  business_name: string | null;
  plan_key: string;
  plan_title?: string;
  sms_monthly_quota: number;
  sms_balance: number;
  started_at: string | null;
  ended_at: string | null;
  has_used_free_trial: boolean;
  has_received_expiry_notification: boolean;
  has_received_expired_notification: boolean;
  created_at: string;
  call_status: "called" | "not_called" | null;
  call_note: string | null;
  call_reason?: string | null;
}

interface ExpiryStatus {
  status: "expired" | "expiring_soon" | "active";
  days_until_expiry: number | null;
  days_since_expiry: number | null;
  is_expired: boolean;
}

interface UserWithStatus extends User {
  expiryStatus: ExpiryStatus;
}

// تایپ‌های فیلترها
type FilterStatus = "all" | "expired" | "expiring_soon" | "active";
type FilterExpiredDays = "all" | "1-10" | "11-20" | "21-30" | "30+";
type FilterCallStatus = "all" | "called" | "not_called";
type FilterPlan = "all" | "free" | "basic" | "gold" | "almas";
type FilterExpiryNotified = "all" | "notified" | "not_notified";

// ============================================================
// صفحه اصلی
// ============================================================
export default function UserManagementPage() {
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // فیلترهای جستجو
  const [searchTerm, setSearchTerm] = useState("");

  // فیلترهای اصلی
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterExpiredDays, setFilterExpiredDays] = useState<FilterExpiredDays>("all");
  const [filterCallStatus, setFilterCallStatus] = useState<FilterCallStatus>("all");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("all");
  const [filterExpiryNotified, setFilterExpiryNotified] = useState<FilterExpiryNotified>("all");

  // مرتب‌سازی
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "expiry_asc" | "expiry_desc">("newest");

  // وضعیت مودال
  const [selectedUser, setSelectedUser] = useState<UserWithStatus | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState("");
  const [editingCallStatus, setEditingCallStatus] = useState<"called" | "not_called" | null>(null);
  const [editingCallReason, setEditingCallReason] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // آمار
  const [stats, setStats] = useState({
    total: 0,
    expired: 0,
    expiringSoon: 0,
    active: 0,
    called: 0,
    notCalled: 0,
    notified: 0,
    notNotified: 0,
  });

  // ============================================================
  // توابع
  // ============================================================
  const calculateExpiryStatus = (user: User): ExpiryStatus => {
    const now = new Date();
    const endDate = user.ended_at ? new Date(user.ended_at) : null;

    if (!endDate) {
      return {
        status: "active",
        days_until_expiry: null,
        days_since_expiry: null,
        is_expired: false,
      };
    }

    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: "expired",
        days_until_expiry: null,
        days_since_expiry: Math.abs(diffDays),
        is_expired: true,
      };
    } else if (diffDays <= 7) {
      // کمتر از ۷ روز = در شرف انقضا
      return {
        status: "expiring_soon",
        days_until_expiry: diffDays,
        days_since_expiry: null,
        is_expired: false,
      };
    } else {
      return {
        status: "active",
        days_until_expiry: diffDays,
        days_since_expiry: null,
        is_expired: false,
      };
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/user-management");
      const data = await res.json();
      if (data.success) {
        const usersWithStatus = data.users.map((user: User) => ({
          ...user,
          expiryStatus: calculateExpiryStatus(user),
        }));
        setUsers(usersWithStatus);
        calculateStats(usersWithStatus);
      } else {
        toast.error(data.message || "خطا در دریافت اطلاعات");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersList: UserWithStatus[]) => {
    const expired = usersList.filter((u) => u.expiryStatus.status === "expired").length;
    const expiringSoon = usersList.filter((u) => u.expiryStatus.status === "expiring_soon").length;
    const active = usersList.filter((u) => u.expiryStatus.status === "active").length;
    const called = usersList.filter((u) => u.call_status === "called").length;
    const notCalled = usersList.filter((u) => u.call_status === "not_called").length;
    const notified = usersList.filter((u) => u.has_received_expired_notification).length;
    const notNotified = usersList.filter((u) => !u.has_received_expired_notification && u.expiryStatus.status === "expired").length;

    setStats({
      total: usersList.length,
      expired,
      expiringSoon,
      active,
      called,
      notCalled,
      notified,
      notNotified,
    });
  };

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // 1. فیلتر وضعیت انقضا
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.expiryStatus.status === filterStatus);
    }

    // 2. فیلتر دقیق روزهای گذشته از انقضا
    if (filterExpiredDays !== "all") {
      filtered = filtered.filter((user) => {
        if (!user.expiryStatus.is_expired) return false;
        const days = user.expiryStatus.days_since_expiry || 0;
        
        switch (filterExpiredDays) {
          case "1-10": return days >= 1 && days <= 10;
          case "11-20": return days >= 11 && days <= 20;
          case "21-30": return days >= 21 && days <= 30;
          case "30+": return days > 30;
          default: return false;
        }
      });
    }

    // 3. فیلتر وضعیت تماس
    if (filterCallStatus !== "all") {
      filtered = filtered.filter((user) => user.call_status === filterCallStatus);
    }

    // 4. فیلتر پلن
    if (filterPlan !== "all") {
      if (filterPlan === "free") {
        filtered = filtered.filter((user) => user.plan_key === "free_trial");
      } else {
        filtered = filtered.filter((user) => user.plan_key === filterPlan);
      }
    }

    // 5. فیلتر اعلان انقضا
    if (filterExpiryNotified !== "all") {
      if (filterExpiryNotified === "notified") {
        filtered = filtered.filter((user) => user.has_received_expired_notification);
      } else {
        filtered = filtered.filter((user) => !user.has_received_expired_notification && user.expiryStatus.status === "expired");
      }
    }

    // 6. فیلتر جستجو
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.phone?.includes(term) ||
          user.business_name?.toLowerCase().includes(term)
      );
    }

    // 7. مرتب‌سازی
    if (sortOption === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortOption === "expiry_asc") {
      filtered.sort((a, b) => {
        if (!a.ended_at) return 1;
        if (!b.ended_at) return -1;
        return new Date(a.ended_at).getTime() - new Date(b.ended_at).getTime();
      });
    } else if (sortOption === "expiry_desc") {
      filtered.sort((a, b) => {
        if (!a.ended_at) return -1;
        if (!b.ended_at) return 1;
        return new Date(b.ended_at).getTime() - new Date(a.ended_at).getTime();
      });
    }

    setFilteredUsers(filtered);
  }, [users, filterStatus, filterExpiredDays, filterCallStatus, filterPlan, filterExpiryNotified, searchTerm, sortOption]);

  // تابع برای ذخیره سریع وضعیت تماس از داخل جدول
  const handleQuickCallStatusUpdate = async (userId: number, status: "called" | "not_called" | null, reason: string = "") => {
    try {
      const res = await fetch("/api/admin/user-management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          callStatus: status,
          callNote: "",
          callReason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("وضعیت تماس با موفقیت به‌روزرسانی شد");
        const updatedUsers = users.map((u) =>
          u.id === userId
            ? { ...u, call_status: status, call_reason: reason }
            : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
      } else {
        toast.error(data.message || "خطا در به‌روزرسانی");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleSaveCallStatus = async (userId: number) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/user-management", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          callStatus: editingCallStatus,
          callNote: editingNote,
          callReason: editingCallReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("وضعیت تماس ذخیره شد");
        const updatedUsers = users.map((u) =>
          u.id === userId
            ? { ...u, call_status: editingCallStatus, call_note: editingNote, call_reason: editingCallReason }
            : u
        );
        setUsers(updatedUsers);
        calculateStats(updatedUsers);
        setIsModalOpen(false);
        setSelectedUser(null);
      } else {
        toast.error(data.message || "خطا در ذخیره‌سازی");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = (user: UserWithStatus) => {
    setSelectedUser(user);
    setEditingNote(user.call_note || "");
    setEditingCallStatus(user.call_status);
    setEditingCallReason(user.call_reason || "");
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterExpiredDays("all");
    setFilterCallStatus("all");
    setFilterPlan("all");
    setFilterExpiryNotified("all");
    setSortOption("newest");
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ============================================================
  // کامپوننت‌های کمکی
  // ============================================================
  const getStatusBadge = (status: ExpiryStatus) => {
    if (status.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          <XCircle className="w-3.5 h-3.5" />
          منقضی شده
        </span>
      );
    }
    if (status.status === "expiring_soon") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <Clock className="w-3.5 h-3.5" />
          در شرف انقضا
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        فعال
      </span>
    );
  };

  const getCallStatusBadge = (callStatus: string | null) => {
    if (callStatus === "called") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">
          <PhoneCall className="w-3 h-3" />
          تماس گرفته شده
        </span>
      );
    }
    if (callStatus === "not_called") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-400">
          <PhoneOff className="w-3 h-3" />
          تماس گرفته نشده
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-400">
        <Phone className="w-3 h-3" />
        ثبت نشده
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    if (!plan || plan === "free_trial") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
          رایگان
        </span>
      );
    }
    switch (plan) {
      case "gold":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            طلایی
          </span>
        );
      case "basic":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
            پایه
          </span>
        );
      case "almas":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
            الماس
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {plan}
          </span>
        );
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("fa-IR");
  };

  // ============================================================
  // رندر
  // ============================================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">در حال بارگذاری اطلاعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ============================================================
      هدر
      ============================================================ */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-400" />
            مدیریت کاربران و اشتراک‌ها
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            مدیریت جامع کاربران، وضعیت اشتراک، ثبت‌نام و پیگیری تماس‌ها
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              isFiltersOpen
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                : "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            }`}
          >
            <ListFilter className="w-4 h-4" />
            فیلترها
            {isFiltersOpen && <ChevronDown className="w-4 h-4 rotate-180" />}
          </button>
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            بروزرسانی
          </button>
        </div>
      </div>

      {/* ============================================================
      کارت‌های آمار
      ============================================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {[
          { label: "کل کاربران", value: stats.total, icon: Users, color: "text-emerald-400", border: "border-emerald-500/20" },
          { label: "فعال", value: stats.active, icon: CheckCircle2, color: "text-emerald-400", border: "border-emerald-500" },
          { label: "در شرف انقضا", value: stats.expiringSoon, icon: Clock, color: "text-yellow-400", border: "border-yellow-500" },
          { label: "منقضی شده", value: stats.expired, icon: XCircle, color: "text-red-400", border: "border-red-500" },
          { label: "تماس گرفته شده", value: stats.called, icon: PhoneCall, color: "text-emerald-400", border: "border-emerald-500" },
          { label: "تماس گرفته نشده", value: stats.notCalled, icon: PhoneOff, color: "text-yellow-400", border: "border-yellow-500" },
          { label: "اعلان شده", value: stats.notified, icon: Bell, color: "text-emerald-400", border: "border-emerald-500" },
          { label: "اعلان نشده", value: stats.notNotified, icon: Bell, color: "text-red-400", border: "border-red-500" },
        ].map((stat, idx) => (
          <div key={idx} className={`bg-[#242933] border ${stat.border} rounded-2xl p-4`}>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}/40`} />
            </div>
            <p className={`text-xl font-bold mt-2 ${stat.color}`}>
              {formatNumber(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* ============================================================
      پنل فیلترها
      ============================================================ */}
      {isFiltersOpen && (
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* فیلتر وضعیت انقضا */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">وضعیت انقضا</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="all">همه</option>
                <option value="active">فعال</option>
                <option value="expiring_soon">در شرف انقضا (کمتر از ۷ روز)</option>
                <option value="expired">منقضی شده</option>
              </select>
            </div>

            {/* فیلتر روزهای گذشته از انقضا */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">روزهای گذشته از انقضا</label>
              <select
                value={filterExpiredDays}
                onChange={(e) => setFilterExpiredDays(e.target.value as FilterExpiredDays)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="all">همه</option>
                <option value="1-10">۱ تا ۱۰ روز</option>
                <option value="11-20">۱۱ تا ۲۰ روز</option>
                <option value="21-30">۲۱ تا ۳۰ روز</option>
                <option value="30+">بیشتر از ۳۰ روز</option>
              </select>
            </div>

            {/* فیلتر وضعیت تماس */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">وضعیت تماس</label>
              <select
                value={filterCallStatus}
                onChange={(e) => setFilterCallStatus(e.target.value as FilterCallStatus)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="all">همه</option>
                <option value="called">تماس گرفته شده</option>
                <option value="not_called">تماس گرفته نشده</option>
              </select>
            </div>

            {/* فیلتر پلن */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">پلن اشتراک</label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as FilterPlan)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="all">همه</option>
                <option value="free">رایگان</option>
                <option value="basic">پایه</option>
                <option value="gold">طلایی</option>
                <option value="almas">الماس</option>
              </select>
            </div>

            {/* فیلتر اعلان انقضا */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">وضعیت اعلان انقضا</label>
              <select
                value={filterExpiryNotified}
                onChange={(e) => setFilterExpiryNotified(e.target.value as FilterExpiryNotified)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="all">همه</option>
                <option value="notified">اعلان ارسال شده</option>
                <option value="not_notified">اعلان ارسال نشده</option>
              </select>
            </div>

            {/* مرتب‌سازی */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">مرتب‌سازی</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
              >
                <option value="newest">جدیدترین</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="expiry_asc">نزدیک‌ترین انقضا</option>
                <option value="expiry_desc">دورترین انقضا</option>
              </select>
            </div>
          </div>

          {/* دکمه‌های مدیریت فیلتر */}
          <div className="flex gap-3 mt-4 pt-4 border-t border-emerald-500/10">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
            >
              پاک کردن همه فیلترها
            </button>
            <div className="text-sm text-gray-400 flex items-center">
              تعداد نمایش داده شده: <span className="text-white font-bold mx-1">{formatNumber(filteredUsers.length)}</span> کاربر
              <span className="text-xs text-gray-500 mr-2">از {formatNumber(stats.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
      جدول کاربران
      ============================================================ */}
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center gap-4 p-4 border-b border-emerald-500/10">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، شماره تلفن یا نام کسب‌وکار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-xl py-2.5 px-4 pr-11 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-4 font-medium">کاربر</th>
                <th className="px-4 py-4 font-medium">کسب‌وکار</th>
                <th className="px-4 py-4 font-medium">پلن</th>
                <th className="px-4 py-4 font-medium">تاریخ پایان</th>
                <th className="px-4 py-4 font-medium">وضعیت</th>
                <th className="px-4 py-4 font-medium w-[280px]">تماس</th>
                <th className="px-4 py-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/10 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-12 h-12 text-gray-600 mb-3" />
                      <p>هیچ کاربری با این شرایط یافت نشد</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                          {user.name?.[0] || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">{user.name || "بدون نام"}</div>
                          <div className="text-xs text-gray-400 dir-ltr">{user.phone}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ثبت‌نام: {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-sm">
                      {user.business_name || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {getPlanBadge(user.plan_key)}
                    </td>
                    <td className="px-4 py-4 text-gray-300 text-xs">
                      {user.ended_at ? (
                        <div>
                          <div>{formatDate(user.ended_at)}</div>
                          {user.expiryStatus.status === "expired" && (
                            <div className="text-red-400 text-[10px] mt-0.5">
                              {user.expiryStatus.days_since_expiry} روز گذشته
                            </div>
                          )}
                          {user.expiryStatus.status === "expiring_soon" && (
                            <div className="text-yellow-400 text-[10px] mt-0.5">
                              {user.expiryStatus.days_until_expiry} روز باقی مانده
                            </div>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(user.expiryStatus)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {/* انتخاب وضعیت تماس */}
                        <select
                          value={user.call_status || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "called" || value === "not_called") {
                              handleQuickCallStatusUpdate(user.id, value, user.call_reason || "");
                            } else {
                              handleQuickCallStatusUpdate(user.id, null, "");
                            }
                          }}
                          className="bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-emerald-400/50 transition text-white min-w-[100px]"
                        >
                          <option value="">ثبت نشده</option>
                          <option value="called">✅ تماس گرفته شده</option>
                          <option value="not_called">⏳ تماس گرفته نشده</option>
                        </select>

                        {/* انتخاب دلیل تماس (فقط اگر تماس گرفته شده) */}
                        {user.call_status === "called" && (
                          <select
                            value={user.call_reason || ""}
                            onChange={(e) => {
                              handleQuickCallStatusUpdate(user.id, user.call_status, e.target.value);
                            }}
                            className="bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-1 px-2 text-xs focus:outline-none focus:border-emerald-400/50 transition text-white min-w-[70px]"
                          >
                            <option value="">دلیل</option>
                            <option value="renewal">تمدید</option>
                            <option value="info">اطلاع‌رسانی</option>
                            <option value="other">سایر</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openModal(user)}
                        className="p-2 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 transition"
                        title="مشاهده و ویرایش کامل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* فوتر جدول */}
        <div className="p-4 border-t border-emerald-500/10 bg-[#1a1e26]/50 text-xs text-gray-400 flex justify-between items-center">
          <span>نمایش {formatNumber(filteredUsers.length)} از {formatNumber(stats.total)} کاربر</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> فعال</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> در شرف انقضا</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> منقضی</span>
          </div>
        </div>
      </div>

      {/* ============================================================
      مودال مدیریت کاربر
      ============================================================ */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* هدر مودال */}
            <div className="sticky top-0 bg-[#242933] border-b border-emerald-500/10 p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedUser.name?.[0] || "?"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name || "بدون نام"}</h3>
                  <p className="text-sm text-gray-400 dir-ltr">{selectedUser.phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedUser.business_name || "کسب‌وکار ثبت نشده"}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="p-6 space-y-6">

              {/* اطلاعات اصلی - ۴ ستونه */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Briefcase className="w-4 h-4" />
                    کسب‌وکار
                  </div>
                  <p className="text-white font-medium truncate">{selectedUser.business_name || "ثبت نشده"}</p>
                </div>
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Wallet className="w-4 h-4" />
                    پلن
                  </div>
                  <p className="text-white font-medium">{getPlanBadge(selectedUser.plan_key)}</p>
                </div>
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <MessageSquare className="w-4 h-4" />
                    پیامک ماهانه
                  </div>
                  <p className="text-white font-medium">{formatNumber(selectedUser.sms_monthly_quota)} پیامک</p>
                </div>
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Users className="w-4 h-4" />
                    وضعیت ثبت‌نام
                  </div>
                  <p className="text-white font-medium">
                    {selectedUser.business_name && selectedUser.plan_key !== "free_trial" ? "✅ کامل" : "⚠️ ناقص"}
                  </p>
                </div>
              </div>

              {/* تاریخ‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    تاریخ شروع
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.started_at)}</p>
                </div>
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    تاریخ پایان
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.ended_at)}</p>
                </div>
                <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <CalendarDays className="w-4 h-4" />
                    تاریخ ثبت‌نام
                  </div>
                  <p className="text-white font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              {/* موجودی پیامک */}
              <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Wallet className="w-4 h-4" />
                    موجودی پیامک
                  </div>
                  <p className="text-white font-bold">{formatNumber(selectedUser.sms_balance)} پیامک</p>
                </div>
              </div>

              {/* وضعیت انقضا (جزئیات) */}
              <div className={`rounded-xl p-4 border ${
                selectedUser.expiryStatus.status === "expired"
                  ? "bg-red-500/5 border-red-500/20"
                  : selectedUser.expiryStatus.status === "expiring_soon"
                  ? "bg-yellow-500/5 border-yellow-500/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {selectedUser.expiryStatus.status === "expired" ? (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    ) : selectedUser.expiryStatus.status === "expiring_soon" ? (
                      <Clock className="w-6 h-6 text-yellow-400" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    )}
                    <div>
                      <div className="text-white font-medium">
                        {selectedUser.expiryStatus.status === "expired"
                          ? `⛔ منقضی شده (${selectedUser.expiryStatus.days_since_expiry} روز پیش)`
                          : selectedUser.expiryStatus.status === "expiring_soon"
                          ? `⚠️ ${selectedUser.expiryStatus.days_until_expiry} روز تا انقضا`
                          : `✅ ${selectedUser.expiryStatus.days_until_expiry} روز تا انقضا`}
                      </div>
                      <div className="text-sm text-gray-400">
                        {selectedUser.has_received_expiry_notification
                          ? "✅ پیامک اطلاع‌رسانی نزدیک انقضا ارسال شده"
                          : "❌ پیامک اطلاع‌رسانی نزدیک انقضا ارسال نشده"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">
                      {selectedUser.has_received_expired_notification
                        ? "✅ پیامک اعلان انقضا ارسال شده"
                        : selectedUser.expiryStatus.status === "expired"
                        ? "❌ پیامک اعلان انقضا ارسال نشده"
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ثبت وضعیت تماس (جزئیات) */}
              <div className="bg-[#1a1e26] rounded-xl p-4 border border-emerald-500/10">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  ویرایش کامل وضعیت تماس
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCallStatus("called")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition ${
                        editingCallStatus === "called"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                          : "border-gray-600 text-gray-400 hover:border-emerald-500/30"
                      }`}
                    >
                      <PhoneCall className="w-4 h-4" />
                      تماس گرفته شده
                    </button>
                    <button
                      onClick={() => setEditingCallStatus("not_called")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border transition ${
                        editingCallStatus === "not_called"
                          ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                          : "border-gray-600 text-gray-400 hover:border-emerald-500/30"
                      }`}
                    >
                      <PhoneOff className="w-4 h-4" />
                      تماس گرفته نشده
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">دلیل تماس:</label>
                    <select
                      value={editingCallReason}
                      onChange={(e) => setEditingCallReason(e.target.value)}
                      className="w-full bg-[#242933] border border-emerald-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white"
                    >
                      <option value="">انتخاب کنید...</option>
                      <option value="renewal">ترغیب کاربر به تمدید اشتراک</option>
                      <option value="info">اطلاع‌رسانی</option>
                      <option value="other">سایر موضوعات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">یادداشت تماس:</label>
                    <textarea
                      placeholder="توضیحات تماس (اختیاری)..."
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      className="w-full bg-[#242933] border border-emerald-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-400/50 transition text-white placeholder-gray-500 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleSaveCallStatus(selectedUser.id)}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  ذخیره تغییرات
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition font-medium"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}