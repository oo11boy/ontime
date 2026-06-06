// app/(admin pages)/admindashboard/expiry-notifications/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  Bell, RefreshCw, Send, Users, CheckCircle2, XCircle, Clock, AlertCircle,
  Calendar, Phone, Building2, TrendingUp, MailWarning, Repeat, Search, Loader2,
  Download, Eye, Trash2, BarChart3, PieChart, Activity, UserCheck, UserX, Mail,
  Menu, X
} from "lucide-react";
import { toast } from "react-hot-toast";

// ============================================
// تایپ‌های داده
// ============================================

interface ExpiryNotificationLog {
  id: number; user_id: number; to_phone: string; content: string;
  sms_type: string; status: string; created_at: string; business_name?: string; error_message?: string;
}

interface ExpiryUser {
  id: number; phone: string; business_name: string; ended_at: string;
  days_left: number; has_received_expiry_notification: number; plan_key: string;
}

interface ExpiredUser {
  id: number; phone: string; business_name: string; ended_at: string; days_ago: number;
  has_received_expired_notification: number; plan_key: string; sms_count: number; last_sent_at: string | null;
}

interface ExpiredNotifiedUser {
  id: number; phone: string; business_name: string; ended_at: string; days_ago: number;
  plan_key: string; sms_count: number; last_sent_at: string;
}

interface FailedUser {
  id: number; phone: string; business_name: string; ended_at: string; type: 'expiry' | 'expired';
}

interface StatsData {
  totalSent: number; totalFailed: number; lastWeekSent: number; successRate: number;
  upcomingExpiries: number; totalExpired: number; totalExpiredNotified: number;
  totalActiveUsers: number; totalUsers: number; avgResponseTime: number;
}

// ============================================
// کامپوننت‌های کمکی
// ============================================

function StatsCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: string | number; icon: any; color: string; subtitle?: string }) {
  return (
    <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs sm:text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString('fa-IR') : value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function SimpleBarChart({ data, title, color = "#10b981" }: { data: { label: string; value: number }[]; title: string; color?: string }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
      <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm sm:text-base"><BarChart3 className="w-5 h-5 text-emerald-400" />{title}</h4>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-xs sm:text-sm mb-1"><span className="text-gray-400">{item.label}</span><span className="text-white">{item.value.toLocaleString('fa-IR')}</span></div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: color }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// کامپوننت اصلی
// ============================================

export default function ExpiryNotificationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<ExpiryNotificationLog[]>([]);
  const [upcomingUsers, setUpcomingUsers] = useState<ExpiryUser[]>([]);
  const [expiredUsers, setExpiredUsers] = useState<ExpiredUser[]>([]);
  const [expiredNotifiedUsers, setExpiredNotifiedUsers] = useState<ExpiredNotifiedUser[]>([]);
  const [failedUsers, setFailedUsers] = useState<FailedUser[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalSent: 0, totalFailed: 0, lastWeekSent: 0, successRate: 0, upcomingExpiries: 0,
    totalExpired: 0, totalExpiredNotified: 0, totalActiveUsers: 0, totalUsers: 0, avgResponseTime: 0
  });
  const [isSending, setIsSending] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ExpiryNotificationLog | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upcoming' | 'expired' | 'expired-notified' | 'failed' | 'logs'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => { fetchAllData(); const interval = setInterval(fetchAllData, 60000); return () => clearInterval(interval); }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try { await Promise.all([fetchLogs(), fetchUpcomingUsers(), fetchExpiredUsers(), fetchExpiredNotifiedUsers(), fetchFailedUsers(), fetchStats()]); }
    catch (error) { console.error("Error fetching data:", error); toast.error("خطا در دریافت اطلاعات"); }
    finally { setIsLoading(false); }
  };

  const fetchLogs = async () => { try { const res = await fetch("/api/admin/expiry-notifications/logs"); const data = await res.json(); if (data.success) setLogs(data.logs); } catch (error) { console.error(error); } };
  const fetchUpcomingUsers = async () => { try { const res = await fetch("/api/admin/expiry-notifications/upcoming"); const data = await res.json(); if (data.success) setUpcomingUsers(data.users); } catch (error) { console.error(error); } };
  const fetchExpiredUsers = async () => { try { const res = await fetch("/api/admin/expiry-notifications/expired"); const data = await res.json(); if (data.success) { setExpiredUsers(data.users); const withoutNotification = data.users.filter((u: any) => u.has_received_expired_notification !== 1).length; setStats(prev => ({ ...prev, totalExpired: withoutNotification })); } } catch (error) { console.error(error); } };
  const fetchExpiredNotifiedUsers = async () => { try { const res = await fetch("/api/admin/expiry-notifications/expired-notified"); const data = await res.json(); if (data.success) { setExpiredNotifiedUsers(data.users); setStats(prev => ({ ...prev, totalExpiredNotified: data.users.length })); } } catch (error) { console.error(error); } };
  const fetchFailedUsers = async () => { try { const res = await fetch("/api/admin/expiry-notifications/failed"); const data = await res.json(); if (data.success) setFailedUsers(data.users); } catch (error) { console.error(error); } };
  const fetchStats = async () => { try { const res = await fetch("/api/admin/expiry-notifications/stats"); const data = await res.json(); if (data.success) setStats(prev => ({ ...prev, ...data.stats })); } catch (error) { console.error(error); } };

  const handleSendManual = async (userId: number, type: 'expiry' | 'expired' = 'expiry') => {
    const message = type === 'expiry' ? "آیا مطمئن هستید؟ پیامک اطلاع‌رسانی 2 روز قبل برای این کاربر ارسال می‌شود." : "آیا مطمئن هستید؟ پیامک اطلاع‌رسانی پس از اتمام اشتراک برای این کاربر ارسال می‌شود.";
    if (!confirm(message)) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/send-expiry-notification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, type }) });
      const data = await res.json();
      if (data.success) { toast.success("پیامک با موفقیت ارسال شد"); await fetchAllData(); }
      else { toast.error(data.error || "خطا در ارسال پیامک"); }
    } catch (error) { toast.error("خطا در ارتباط با سرور"); }
    finally { setIsSending(false); }
  };

  const handleResendForNotified = async (userId: number, type: 'expiry' | 'expired' = 'expired') => {
    const message = "آیا مطمئن هستید؟ می‌خواهید دوباره پیامک برای این کاربر ارسال شود؟";
    if (!confirm(message)) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/send-expiry-notification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, type, force: true }) });
      const data = await res.json();
      if (data.success) { toast.success("پیامک مجدد با موفقیت ارسال شد"); await fetchAllData(); }
      else { toast.error(data.error || "خطا در ارسال پیامک"); }
    } catch (error) { toast.error("خطا در ارتباط با سرور"); }
    finally { setIsSending(false); }
  };

  const handleRetryFailed = async () => {
    if (!confirm("آیا مطمئن هستید؟ پیامک برای همه کاربران ناموفق دوباره ارسال می‌شود.")) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/expiry-notifications/retry", { method: "POST" });
      const data = await res.json();
      if (data.success) { toast.success(`${data.successCount} پیامک با موفقیت ارسال شد`); await fetchAllData(); }
      else { toast.error(data.error || "خطا در ارسال مجدد"); }
    } catch (error) { toast.error("خطا در ارتباط با سرور"); }
    finally { setIsSending(false); }
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm("آیا مطمئن هستید؟ این لاگ حذف می‌شود.")) return;
    try {
      const res = await fetch(`/api/admin/expiry-notifications/logs/${logId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("لاگ با موفقیت حذف شد"); await fetchLogs(); }
      else { toast.error(data.error || "خطا در حذف لاگ"); }
    } catch (error) { toast.error("خطا در ارتباط با سرور"); }
  };

  const handleExportLogs = () => {
    const filtered = logs.filter(log => 
      (searchTerm === '' || log.to_phone.includes(searchTerm) || (log.business_name && log.business_name.includes(searchTerm)) || log.content.includes(searchTerm)) &&
      (dateFilter === '' || log.created_at.split('T')[0] === dateFilter)
    );
    const csv = [['تاریخ ارسال', 'کاربر', 'شماره مقصد', 'نوع پیامک', 'وضعیت', 'متن پیامک'],
      ...filtered.map(log => [formatDateTime(log.created_at), log.business_name || 'بدون نام', log.to_phone, log.sms_type === 'expiry_notification' ? 'اطلاع‌رسانی 2 روز قبل' : log.sms_type === 'expired_notification' ? 'پس از انقضا' : 'ارسال دستی', log.status === 'sent' ? 'موفق' : 'ناموفق', log.content])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); const url = URL.createObjectURL(blob);
    link.href = url; link.setAttribute('download', `expiry_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    toast.success("خروجی با موفقیت گرفته شد");
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('fa-IR');
  const formatDateTime = (date: string) => new Date(date).toLocaleString('fa-IR');
  const getStatusColor = (status: string) => ({ 'sent': 'text-green-400 bg-green-400/10', 'failed': 'text-red-400 bg-red-400/10', 'pending': 'text-yellow-400 bg-yellow-400/10' }[status] || 'text-gray-400 bg-gray-400/10');
  const getStatusText = (status: string) => ({ 'sent': 'ارسال شده', 'failed': 'ناموفق', 'pending': 'در انتظار' }[status] || status);

  const weeklyData = [{ label: 'شنبه', value: 25 }, { label: 'یکشنبه', value: 32 }, { label: 'دوشنبه', value: 28 }, { label: 'سه‌شنبه', value: 35 }, { label: 'چهارشنبه', value: 42 }, { label: 'پنجشنبه', value: 38 }, { label: 'جمعه', value: 20 }];
  const planDistribution = [{ label: 'طلایی', value: 12, color: '#fbbf24' }, { label: 'نقره‌ای', value: 28, color: '#9ca3af' }, { label: 'برنزی', value: 45, color: '#cd7f32' }, { label: 'رایگان', value: 15, color: '#10b981' }];

  const tabs = [
    { id: 'dashboard' as const, label: 'داشبورد', icon: BarChart3, count: null },
    { id: 'upcoming' as const, label: 'در حال انقضا', icon: AlertCircle, count: upcomingUsers.length },
    { id: 'expired' as const, label: 'منقضی شده', icon: Calendar, count: expiredUsers.length },
    { id: 'expired-notified' as const, label: 'منقضی + اطلاع', icon: CheckCircle2, count: expiredNotifiedUsers.length },
    { id: 'failed' as const, label: 'ناموفق', icon: XCircle, count: failedUsers.length },
    { id: 'logs' as const, label: 'تاریخچه', icon: MailWarning, count: logs.length },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><div className="text-center"><Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" /><p className="text-gray-400">در حال دریافت اطلاعات...</p></div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"><Bell className="text-emerald-400 w-6 h-6 sm:w-7 sm:h-7" />مدیریت اطلاع‌رسانی انقضای اشتراک</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">پنل جامع مدیریت و پایش پیامک‌های اطلاع‌رسانی انقضای اشتراک</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button onClick={handleRetryFailed} disabled={isSending} className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-medium transition-all disabled:opacity-50">
            {isSending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />}<span className="hidden sm:inline">ارسال مجدد ناموفق‌ها</span><span className="sm:hidden">ارسال مجدد</span>
          </button>
          <button onClick={fetchAllData} disabled={isSending} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-medium transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isSending ? 'animate-spin' : ''}`} /><span className="hidden sm:inline">بروزرسانی</span>
          </button>
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden bg-gray-700/50 p-2 rounded-xl"><Menu className="w-5 h-5 text-white" /></button>
        </div>
      </div>

      {/* Mobile Tab Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1e26] rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex justify-between items-center mb-3"><span className="text-white font-bold">انتخاب بخش</span><button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5 text-gray-400" /></button></div>
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#242933] text-gray-400 hover:text-gray-300'}`}>
                <tab.icon className="w-4 h-4" /><span>{tab.label}</span>{tab.count !== null && <span className="text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block border-b border-gray-700 overflow-x-auto"><nav className="flex gap-2 pb-1 min-w-max">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-t-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'}`}>
            <div className="flex items-center gap-2"><tab.icon className="w-4 h-4" />{tab.label}{tab.count !== null && <span className="text-xs">({tab.count})</span>}</div>
          </button>
        ))}
      </nav></div>

      {/* ========== DASHBOARD TAB ========== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
            <StatsCard title="کل ارسال‌ها" value={stats.totalSent} icon={Send} color="text-emerald-400" subtitle={`ناموفق: ${stats.totalFailed}`} />
            <StatsCard title="نرخ موفقیت" value={`${stats.successRate}%`} icon={TrendingUp} color="text-purple-400" />
            <StatsCard title="ارسال هفته" value={stats.lastWeekSent} icon={Activity} color="text-blue-400" />
            <StatsCard title="در حال انقضا" value={stats.upcomingExpiries} icon={AlertCircle} color="text-orange-400" subtitle="2 روز مونده" />
            <StatsCard title="منقضی شده (بدون پیامک)" value={stats.totalExpired} icon={UserX} color="text-red-400" />
            <StatsCard title="منقضی + اطلاع" value={stats.totalExpiredNotified} icon={UserCheck} color="text-green-400" />
            <StatsCard title="کاربران فعال" value={stats.totalActiveUsers || 0} icon={Users} color="text-cyan-400" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <SimpleBarChart data={weeklyData} title="آمار ارسال پیامک در هفته جاری" color="#10b981" />
            <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-4 sm:p-6"><h4 className="text-white font-bold mb-4 flex items-center gap-2 text-sm sm:text-base"><PieChart className="w-5 h-5 text-emerald-400" />توزیع پلن‌های فعال</h4><div className="space-y-3">{planDistribution.map((plan, idx) => (<div key={idx}><div className="flex justify-between text-xs sm:text-sm mb-1"><span className="text-gray-400">{plan.label}</span><span className="text-white">{plan.value}%</span></div><div className="h-2 bg-gray-700 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${plan.value}%`, backgroundColor: plan.color }} /></div></div>))}</div></div>
          </div>
          <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-2xl p-4 sm:p-6"><h4 className="text-white font-bold mb-3 flex items-center gap-2 text-sm sm:text-base"><Activity className="w-5 h-5 text-emerald-400" />وضعیت سیستم اطلاع‌رسانی</h4><div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-400">سیستم فعال و در حال اجرا</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-gray-400">کرون جاب: هر روز ساعت 10 و 11 و 14 و 20</span></div><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-400">آخرین بروزرسانی: {formatDateTime(new Date().toISOString())}</span></div></div></div>
        </div>
      )}

      {/* ========== UPCOMING TAB ========== */}
      {activeTab === 'upcoming' && (
        <div className="bg-[#242933] border border-orange-500/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-orange-500/10"><h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap"><AlertCircle className="w-5 h-5 text-orange-400" />کاربرانی که ۲ روز دیگر اشتراکشان تمام می‌شود<span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full">{upcomingUsers.length} نفر</span></h3></div>
          <div className="overflow-x-auto"><table className="w-full text-right min-w-[600px]"><thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase"><tr><th className="px-4 sm:px-6 py-3 sm:py-4">نام کسب‌وکار</th><th className="px-4 sm:px-6 py-3 sm:py-4">شماره تماس</th><th className="px-4 sm:px-6 py-3 sm:py-4">پلن</th><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ انقضا</th><th className="px-4 sm:px-6 py-3 sm:py-4">روزهای باقی</th><th className="px-4 sm:px-6 py-3 sm:py-4">عملیات</th></tr></thead>
          <tbody className="divide-y divide-emerald-500/10">{upcomingUsers.length === 0 ? <tr><td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-600 mb-3" /><p>هیچ کاربری با ۲ روز مونده وجود ندارد</p></div></td></tr> : upcomingUsers.map((user) => (<tr key={user.id} className="hover:bg-white/5 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /><span className="text-white text-sm">{user.business_name || "بدون نام"}</span></div></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm dir-ltr">{user.phone}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{user.plan_key}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-yellow-400 text-xs sm:text-sm">{formatDate(user.ended_at)}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-full text-xs">{user.days_left} روز</span></td><td className="px-4 sm:px-6 py-3 sm:py-4"><button onClick={() => handleSendManual(user.id, 'expiry')} disabled={isSending} className="px-2 sm:px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3" />ارسال</button></td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* ========== EXPIRED TAB (All expired users) ========== */}
      {activeTab === 'expired' && (
        <div className="bg-[#242933] border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-red-500/10"><h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap"><Calendar className="w-5 h-5 text-red-400" />همه کاربرانی که اشتراکشان منقضی شده است<span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">{expiredUsers.length} نفر</span></h3><p className="text-gray-500 text-xs sm:text-sm mt-2">لیست کامل کاربران با اشتراک منقضی شده (چه پیامک گرفته باشند چه نه)</p></div>
          <div className="overflow-x-auto"><table className="w-full text-right min-w-[700px]"><thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase"><tr><th className="px-4 sm:px-6 py-3 sm:py-4">نام کسب‌وکار</th><th className="px-4 sm:px-6 py-3 sm:py-4">شماره تماس</th><th className="px-4 sm:px-6 py-3 sm:py-4">پلن</th><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ انقضا</th><th className="px-4 sm:px-6 py-3 sm:py-4">روزهای گذشته</th><th className="px-4 sm:px-6 py-3 sm:py-4">وضعیت پیامک</th><th className="px-4 sm:px-6 py-3 sm:py-4">عملیات</th></tr></thead>
          <tbody className="divide-y divide-emerald-500/10">{expiredUsers.length === 0 ? <tr><td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-600 mb-3" /><p>هیچ کاربر منقضی شده‌ای وجود ندارد</p></div></td></tr> : expiredUsers.map((user) => (<tr key={user.id} className="hover:bg-white/5 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /><span className="text-white text-sm">{user.business_name || "بدون نام"}</span></div></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm dir-ltr">{user.phone}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs">{user.plan_key}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-red-400 text-xs sm:text-sm">{formatDate(user.ended_at)}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">{user.days_ago} روز پیش</span></td><td className="px-4 sm:px-6 py-3 sm:py-4">{user.has_received_expired_notification === 1 ? <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle2 className="w-3 h-3" />ارسال شده</span> : <span className="flex items-center gap-1 text-yellow-400 text-xs"><Clock className="w-3 h-3" />در انتظار</span>}</td><td className="px-4 sm:px-6 py-3 sm:py-4">{user.has_received_expired_notification === 1 ? <button onClick={() => handleResendForNotified(user.id, 'expired')} disabled={isSending} className="px-2 sm:px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition disabled:opacity-50 flex items-center gap-1"><Repeat className="w-3 h-3" />ارسال مجدد</button> : <button onClick={() => handleSendManual(user.id, 'expired')} disabled={isSending} className="px-2 sm:px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3" />ارسال</button>}</td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* ========== EXPIRED NOTIFIED TAB ========== */}
      {activeTab === 'expired-notified' && (
        <div className="bg-[#242933] border border-green-500/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-green-500/10"><h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap"><CheckCircle2 className="w-5 h-5 text-green-400" />کاربرانی که پیامک پس از انقضا برایشان ارسال شده<span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">{expiredNotifiedUsers.length} نفر</span></h3><p className="text-gray-500 text-xs sm:text-sm mt-2">این کاربران پیامک اطلاع‌رسانی دریافت کرده‌اند اما هنوز تمدید نکرده‌اند</p></div>
          <div className="overflow-x-auto"><table className="w-full text-right min-w-[700px]"><thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase"><tr><th className="px-4 sm:px-6 py-3 sm:py-4">نام کسب‌وکار</th><th className="px-4 sm:px-6 py-3 sm:py-4">شماره تماس</th><th className="px-4 sm:px-6 py-3 sm:py-4">پلن</th><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ انقضا</th><th className="px-4 sm:px-6 py-3 sm:py-4">روزهای گذشته</th><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ ارسال</th><th className="px-4 sm:px-6 py-3 sm:py-4">تعداد</th><th className="px-4 sm:px-6 py-3 sm:py-4">عملیات</th></tr></thead>
          <tbody className="divide-y divide-emerald-500/10">{expiredNotifiedUsers.length === 0 ? <tr><td colSpan={8} className="px-4 sm:px-6 py-8 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-600 mb-3" /><p>هیچ کاربری با پیامک ارسال شده وجود ندارد</p></div></td></tr> : expiredNotifiedUsers.map((user) => (<tr key={user.id} className="hover:bg-white/5 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /><span className="text-white text-sm">{user.business_name || "بدون نام"}</span></div></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm dir-ltr">{user.phone}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs">{user.plan_key}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-red-400 text-xs sm:text-sm">{formatDate(user.ended_at)}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">{user.days_ago} روز پیش</span></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-xs">{user.last_sent_at ? formatDateTime(user.last_sent_at) : '—'}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">{user.sms_count} بار</span></td><td className="px-4 sm:px-6 py-3 sm:py-4"><button onClick={() => handleResendForNotified(user.id, 'expired')} disabled={isSending} className="px-2 sm:px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20 transition disabled:opacity-50 flex items-center gap-1"><Repeat className="w-3 h-3" />ارسال مجدد</button></td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* ========== FAILED TAB ========== */}
      {activeTab === 'failed' && (
        <div className="bg-[#242933] border border-red-500/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-red-500/10"><h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 flex-wrap"><XCircle className="w-5 h-5 text-red-400" />کاربرانی که پیامک برایشان ارسال نشده<span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full">{failedUsers.length} نفر</span></h3><p className="text-gray-500 text-xs sm:text-sm mt-2">این کاربران به دلایل فنی پیامک را دریافت نکرده‌اند</p></div>
          <div className="overflow-x-auto"><table className="w-full text-right min-w-[500px]"><thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase"><tr><th className="px-4 sm:px-6 py-3 sm:py-4">نام کسب‌وکار</th><th className="px-4 sm:px-6 py-3 sm:py-4">شماره تماس</th><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ انقضا</th><th className="px-4 sm:px-6 py-3 sm:py-4">نوع پیامک</th><th className="px-4 sm:px-6 py-3 sm:py-4">عملیات</th></tr></thead>
          <tbody className="divide-y divide-emerald-500/10">{failedUsers.length === 0 ? <tr><td colSpan={5} className="px-4 sm:px-6 py-8 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><CheckCircle2 className="w-12 h-12 text-green-600 mb-3" /><p>هیچ کاربر ناموفقی وجود ندارد</p></div></td></tr> : failedUsers.map((user, idx) => (<tr key={`${user.id}-${user.type}-${idx}`} className="hover:bg-white/5 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /><span className="text-white text-sm">{user.business_name || "بدون نام"}</span></div></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs sm:text-sm dir-ltr">{user.phone}</td><td className="px-4 sm:px-6 py-3 sm:py-4 text-yellow-400 text-xs sm:text-sm">{formatDate(user.ended_at)}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className={`px-2 py-1 rounded-full text-xs ${user.type === 'expiry' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>{user.type === 'expiry' ? 'اطلاع‌رسانی 2 روز قبل' : 'پس از انقضا'}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4"><button onClick={() => handleSendManual(user.id, user.type)} disabled={isSending} className="px-2 sm:px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs hover:bg-emerald-500/20 transition disabled:opacity-50 flex items-center gap-1"><Send className="w-3 h-3" />ارسال مجدد</button></td></tr>))}</tbody></table></div>
        </div>
      )}

      {/* ========== LOGS TAB ========== */}
      {activeTab === 'logs' && (
        <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-emerald-500/10"><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"><MailWarning className="w-5 h-5 text-emerald-400" />تاریخچه ارسال پیامک‌ها<span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full">{logs.length} رکورد</span></h3><div className="flex gap-2 flex-wrap w-full sm:w-auto"><div className="relative flex-1 sm:flex-initial"><Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" /><input type="text" placeholder="جستجو..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#1a1e26] border border-gray-700 rounded-lg py-2 pr-9 pl-3 text-sm text-white placeholder-gray-400 focus:border-emerald-500 outline-none" /></div><input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-[#1a1e26] border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:border-emerald-500 outline-none" /><button onClick={handleExportLogs} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all"><Download className="w-4 h-4" /><span className="hidden sm:inline">خروجی CSV</span></button></div></div></div>
          <div className="overflow-x-auto"><table className="w-full text-right min-w-[800px]"><thead className="bg-[#1a1e26] text-gray-400 text-xs uppercase"><tr><th className="px-4 sm:px-6 py-3 sm:py-4">تاریخ ارسال</th><th className="px-4 sm:px-6 py-3 sm:py-4">کاربر</th><th className="px-4 sm:px-6 py-3 sm:py-4">شماره</th><th className="px-4 sm:px-6 py-3 sm:py-4">نوع</th><th className="px-4 sm:px-6 py-3 sm:py-4">متن</th><th className="px-4 sm:px-6 py-3 sm:py-4">وضعیت</th><th className="px-4 sm:px-6 py-3 sm:py-4">عملیات</th></tr></thead>
          <tbody className="divide-y divide-emerald-500/10">{(() => { const filtered = logs.filter(log => (searchTerm === '' || log.to_phone.includes(searchTerm) || (log.business_name && log.business_name.includes(searchTerm)) || log.content.includes(searchTerm)) && (dateFilter === '' || log.created_at.split('T')[0] === dateFilter)); return filtered.length === 0 ? <tr><td colSpan={7} className="px-4 sm:px-6 py-8 text-center text-gray-400"><div className="flex flex-col items-center justify-center"><Bell className="w-12 h-12 text-gray-600 mb-3" /><p>هیچ پیامکی ارسال نشده است</p></div></td></tr> : filtered.map((log) => (<tr key={log.id} className="hover:bg-white/5 transition-colors"><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(log.created_at)}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /><span className="text-white text-xs">{log.business_name || "بدون نام"}</span></div></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-300 text-xs dir-ltr">{log.to_phone}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className={`px-2 py-1 rounded-full text-xs ${log.sms_type === 'expiry_notification' ? 'bg-blue-500/10 text-blue-400' : log.sms_type === 'expired_notification' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>{log.sms_type === 'expiry_notification' ? '2 روز قبل' : log.sms_type === 'expired_notification' ? 'پس از انقضا' : 'دستی'}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-xs max-w-md truncate">{log.content}</td><td className="px-4 sm:px-6 py-3 sm:py-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>{log.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}{getStatusText(log.status)}</span></td><td className="px-4 sm:px-6 py-3 sm:py-4"><div className="flex gap-2"><button onClick={() => setSelectedLog(log)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="مشاهده جزئیات"><Eye className="w-4 h-4" /></button><button onClick={() => handleDeleteLog(log.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="حذف لاگ"><Trash2 className="w-4 h-4" /></button></div></td></tr>)); })()}</tbody></table></div>
        </div>
      )}

      {/* Modal for log details */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedLog(null)}>
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-emerald-500/20 flex justify-between items-center"><h3 className="text-lg sm:text-xl font-bold text-white">جزئیات پیامک</h3><button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white"><XCircle className="w-6 h-6" /></button></div>
            <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto"><div><label className="text-sm text-gray-400">تاریخ ارسال</label><p className="text-white mt-1 text-sm">{formatDateTime(selectedLog.created_at)}</p></div><div><label className="text-sm text-gray-400">کاربر</label><p className="text-white mt-1 text-sm break-words">{selectedLog.business_name || "بدون نام"} (ID: {selectedLog.user_id})</p></div><div><label className="text-sm text-gray-400">گیرنده</label><p className="text-white mt-1 text-sm dir-ltr">{selectedLog.to_phone}</p></div><div><label className="text-sm text-gray-400">نوع پیامک</label><p className="mt-1"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${selectedLog.sms_type === 'expiry_notification' ? 'bg-blue-500/10 text-blue-400' : selectedLog.sms_type === 'expired_notification' ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-500/10 text-gray-400'}`}>{selectedLog.sms_type === 'expiry_notification' ? 'اطلاع‌رسانی 2 روز قبل' : selectedLog.sms_type === 'expired_notification' ? 'پس از انقضا' : 'ارسال دستی'}</span></p></div><div><label className="text-sm text-gray-400">وضعیت</label><p className={`mt-1 flex items-center gap-2 text-sm ${selectedLog.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>{selectedLog.status === 'sent' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}{selectedLog.status === 'sent' ? 'ارسال موفق' : 'ارسال ناموفق'}</p></div><div><label className="text-sm text-gray-400">متن پیامک</label><div className="bg-[#1a1e26] p-3 rounded-xl mt-1"><p className="text-gray-300 text-sm whitespace-pre-wrap break-words">{selectedLog.content}</p></div></div>{selectedLog.error_message && (<div><label className="text-sm text-red-400">خطا</label><div className="bg-red-500/10 p-3 rounded-xl mt-1"><p className="text-red-400 text-sm">{selectedLog.error_message}</p></div></div>)}</div>
            <div className="p-4 sm:p-6 border-t border-emerald-500/20"><button onClick={() => setSelectedLog(null)} className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition">بستن</button></div>
          </div>
        </div>
      )}
    </div>
  );
}