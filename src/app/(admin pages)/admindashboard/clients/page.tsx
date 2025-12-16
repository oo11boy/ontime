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
  ExternalLink,
  TrendingUp,
  Award,
  BarChart3,
  Target,
  Activity,
  Loader2
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

// کامپوننت مودال جزئیات
function ClientDetailsModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'sms' | 'analytics'>('overview');

  useEffect(() => {
    fetchClientDetails();
  }, [client.id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard/top-businesses?id=${client.id}`);
      const data = await res.json();
      
      if (data.success) {
        setDetails({
          ...client,
          total_bookings: data.business.total_bookings || 0,
          cancellation_rate: data.business.cancellation_rate || 0,
          recent_bookings: data.business.recent_bookings || [],
          popular_services: data.business.popular_services || [],
          registration_date: data.business.registration_date || client.registrationDate
        });
      } else {
        setDetails({
          ...client,
          total_bookings: 0,
          cancellation_rate: 0,
          recent_bookings: [],
          popular_services: [],
          registration_date: client.registrationDate
        });
      }
    } catch (err) {
      toast.error("خطا در دریافت جزئیات");
      setDetails({
        ...client,
        total_bookings: 0,
        cancellation_rate: 0,
        recent_bookings: [],
        popular_services: [],
        registration_date: client.registrationDate
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num === 0 || num === null || num === undefined) return "۰";
    return num.toLocaleString('fa-IR');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "نامشخص";
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "نامشخص";
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">فعال</span>;
      case 'done':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">تکمیل شده</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">لغو شده</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">{status}</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'طلایی':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">{plan}</span>;
      case 'پلن پایه':
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{plan}</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{plan}</span>;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-4xl p-8">
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-gray-400">در حال دریافت اطلاعات کسب‌وکار...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* هدر مودال */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner ${
              !details.hasCompleteProfile 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-linear-to-br from-gray-700 to-gray-800 border border-white/10 text-emerald-400'
            }`}>
              {details.businessName[0] || "?"}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {details.businessName}
                {!details.hasCompleteProfile && (
                  <span className="mr-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircle className="w-3 h-3" />
                    ثبت‌نام ناقص
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {details.jobTitle}
                </span>
                <span>•</span>
                <span>{getPlanBadge(details.plan)}</span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${details.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                  <Activity className="w-3 h-3" />
                  {details.status === "active" ? "فعال" : "منقضی"}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* تب‌های ناوبری */}
        <div className="border-b border-emerald-500/10">
          <div className="flex overflow-x-auto">
            {['overview', 'bookings', 'sms', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === 'overview' && <>📊 اطلاعات کلی</>}
                {tab === 'bookings' && <>📅 نوبت‌ها و خدمات</>}
                {tab === 'sms' && <>💬 پیامک و اعتبار</>}
                {tab === 'analytics' && <>📈 آمار و تحلیل</>}
              </button>
            ))}
          </div>
        </div>

        {/* محتوای تب‌ها */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {/* تب اطلاعات کلی */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "مشتریان", value: details.customerCount, color: "text-blue-400" },
                  { icon: Calendar, label: "کل نوبت‌ها", value: details.total_bookings, color: "text-emerald-400" },
                  { icon: AlertCircle, label: "نرخ لغو", value: `${details.cancellation_rate}%`, color: details.cancellation_rate > 20 ? "text-red-400" : "text-yellow-400" },
                  { icon: MessageSquare, label: "پیامک باقیمانده", value: details.totalRemainingSms, color: "text-purple-400" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <stat.icon className="w-4 h-4" />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    اطلاعات تماس
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">نام:</span>
                      <span className="font-bold text-white">{details.businessName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">شماره:</span>
                      <span className="font-mono text-white">{details.phone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">شغل:</span>
                      <span className="text-emerald-400">{details.jobTitle}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">تاریخ ثبت‌نام:</span>
                      <span className="text-gray-300">{formatDate(details.registration_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    اطلاعات پلن
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">پلن:</span>
                      {getPlanBadge(details.plan)}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">وضعیت:</span>
                      <span className={`font-bold ${details.status === "active" ? "text-emerald-400" : "text-red-400"}`}>
                        {details.status === "active" ? "فعال" : "منقضی"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">پروفایل:</span>
                      <span className={`font-bold ${details.hasCompleteProfile ? "text-emerald-400" : "text-amber-400"}`}>
                        {details.hasCompleteProfile ? "کامل" : "ناقص"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${details.hasCompleteProfile ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: details.hasCompleteProfile ? '100%' : '60%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب نوبت‌ها */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {details.popular_services && details.popular_services.length > 0 && (
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    خدمات محبوب
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {details.popular_services.map((service: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                        <span className="text-emerald-400 font-medium">{service.name}</span>
                        <span className="text-xs text-gray-400">({service.booking_count} نوبت)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  آخرین نوبت‌ها
                </h4>
                {details.recent_bookings && details.recent_bookings.length > 0 ? (
                  <div className="space-y-3">
                    {details.recent_bookings.map((booking: any) => (
                      <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-[#242933] rounded-lg border border-white/5">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                              {booking.client_name?.[0] || "?"}
                            </div>
                            <div>
                              <div className="font-bold text-white">{booking.client_name || "نامشخص"}</div>
                              <div className="text-xs text-gray-400">{booking.services || 'بدون سرویس'}</div>
                            </div>
                          </div>
                          {booking.booking_description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {booking.booking_description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">
                              {formatDate(booking.booking_date)}
                            </div>
                            <div className="text-xs text-gray-400">
                              ساعت {formatTime(booking.booking_time)}
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3" />
                    هنوز نوبتی ثبت نشده است
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">کل نوبت‌ها</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(details.total_bookings)}</div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">میانگین ماهانه</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(Math.round(details.total_bookings / 3))}</div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">نرخ تکمیل</span>
                    <Target className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{100 - details.cancellation_rate}%</div>
                </div>
              </div>
            </div>
          )}

          {/* تب پیامک */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  وضعیت اعتبار پیامک
                </h4>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" stroke="#334155" strokeWidth="10" fill="none" opacity="0.6" />
                      <circle cx="60" cy="60" r="54" stroke="#10B981" strokeWidth="10" fill="none" 
                        strokeDasharray={339.292} 
                        strokeDashoffset={339.292 - ((details.totalRemainingSms / 1000) * 339.292)} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${details.totalRemainingSms < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {formatNumber(details.totalRemainingSms)}
                        </div>
                        <div className="text-sm text-gray-400">پیامک باقیمانده</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#242933] border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">پلن ماهانه</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {formatNumber(details.planBalance)}
                    </div>
                  </div>
                  <div className="bg-[#242933] border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">بسته‌های خریداری شده</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatNumber(details.purchasedPackagesBalance)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  تحلیل مصرف
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">میانگین مصرف روزانه</span>
                      <span className="font-bold text-white">~{Math.round(details.total_bookings / 30)} پیامک</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (details.total_bookings / 30) / 10 * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">اعتبار باقیمانده (روز)</span>
                      <span className={`font-bold ${(details.totalRemainingSms / (details.total_bookings / 30)) < 7 ? 'text-red-400' : 'text-emerald-400'}`}>
                        ~{Math.round(details.totalRemainingSms / (details.total_bookings / 30 + 1))} روز
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${(details.totalRemainingSms / (details.total_bookings / 30)) < 7 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (details.totalRemainingSms / 1000) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب آمار */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    روند نوبت‌دهی
                  </h4>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[30, 45, 25, 60, 80, 95, 50].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500/40 transition"
                          style={{ height: `${value}%` }} />
                        <span className="text-[10px] text-gray-500">روز {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    توزیع وضعیت
                  </h4>
                  <div className="flex items-center justify-center h-48">
                    <div className="w-40 h-40 rounded-full flex items-center justify-center"
                      style={{
                        background: `conic-gradient(
                          #10b981 0% 70%, 
                          #f59e0b 70% 85%, 
                          #ef4444 85% 100%
                        )`
                      }}
                    >
                      <div className="w-28 h-28 bg-[#1a1e26] rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">70%</div>
                          <div className="text-xs text-gray-400">تکمیل شده</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "رضایت مشتری", value: "85%", color: "text-emerald-400", bg: "bg-emerald-500" },
                  { label: "رشد ماهانه", value: "+12%", color: "text-blue-400", bg: "bg-blue-500" },
                  { label: "مشتریان وفادار", value: "42%", color: "text-yellow-400", bg: "bg-yellow-500" },
                  { label: "کارایی سیستم", value: "92%", color: "text-purple-400", bg: "bg-purple-500" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <div className={`w-2 h-2 rounded-full ${stat.bg}`} />
                      <span className="text-xs">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full ${stat.bg}`} style={{ width: stat.value.replace('%', '').replace('+', '') + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* فوتر */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#1a1e26] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-400">
            شناسه: {details.id} • آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
          </div>
          <div className="flex gap-2">
            <button className="text-sm text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              ویرایش
            </button>
            <button className="text-sm text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              جزئیات بیشتر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت اصلی
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");
  const [stats, setStats] = useState({ total: 0, complete: 0, incomplete: 0 });
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", job_id: "" });
  const [jobs, setJobs] = useState<{ id: number; persian_name: string }[]>([]);

  // Debounce برای جستجو
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // بارگذاری اولیه
  useEffect(() => {
    fetchClients();
    fetchJobs();
  }, []);

  // بارگذاری خودکار
  useEffect(() => {
    fetchClients();
  }, [debouncedSearchQuery, selectedFilter]);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/admin/jobs");
      const data = await res.json();
      if (data.jobs) setJobs(data.jobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

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

  const handleDelete = async (client: Client) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید "${client.businessName}" را حذف کنید؟`)) return;

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

  const startEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    const job = jobs.find(j => j.persian_name === client.jobTitle);
    setEditForm({
      name: client.businessName === 'ثبت‌نام ناقص' ? '' : client.businessName,
      phone: client.phone,
      job_id: job?.id.toString() || "",
    });
  };

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

  const formatNumber = (num: number) => {
    if (num === 0 || num === null || num === undefined) return "۰";
    return num.toLocaleString('fa-IR');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
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
          <button onClick={fetchClients} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition" title="بروزرسانی لیست">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* آمار و فیلترها */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "کل کسب‌وکارها", value: stats.total, icon: Users, color: "text-white", bg: "border-emerald-500/20" },
          { label: "ثبت‌نام کامل", value: stats.complete, icon: Check, color: "text-emerald-400", bg: "border-emerald-500", isActive: selectedFilter === "complete" },
          { label: "ثبت‌نام ناقص", value: stats.incomplete, icon: AlertCircle, color: "text-amber-400", bg: "border-amber-500", isActive: selectedFilter === "incomplete" },
          { label: "همه", value: "نمایش همه", icon: Filter, color: "text-blue-400", bg: "border-blue-500", isActive: selectedFilter === "all" }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-[#242933] border rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] ${stat.isActive ? stat.bg + ' bg-' + stat.color.split('-')[1] + '/10' : 'border-emerald-500/20'}`}
            onClick={() => setSelectedFilter(idx === 1 ? "complete" : idx === 2 ? "incomplete" : idx === 3 ? "all" : selectedFilter)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                </p>
              </div>
              <stat.icon className={`w-10 h-10 ${stat.color}/40`} />
            </div>
          </div>
        ))}
      </div>

      {/* نوار جستجو */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input type="text" placeholder="جستجو نام کسب‌وکار، شماره یا شغل..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#242933] border border-emerald-500/30 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:border-emerald-400 transition" />
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setSearchQuery(""); setSelectedFilter("all"); }}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition">
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
              <button onClick={() => setEditingClient(null)} className="p-2 rounded-lg hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">نام کسب‌وکار</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500" placeholder="نام کسب‌وکار را وارد کنید" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">شماره تماس</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500" placeholder="مثال: 09123456789" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">شغل</label>
                <select value={editForm.job_id} onChange={(e) => setEditForm({...editForm, job_id: e.target.value})}
                  className="w-full bg-[#1a1e26] border border-emerald-500/20 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-emerald-500">
                  <option value="">انتخاب شغل</option>
                  {jobs.map(job => <option key={job.id} value={job.id}>{job.persian_name}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={handleSaveEdit} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition">
                  ذخیره تغییرات
                </button>
                <button onClick={() => setEditingClient(null)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition">
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
                    <tr key={client.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedClient(client)}>
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
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                          client.plan === "طلایی" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          client.plan === "پلن پایه" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          <Crown className="w-3 h-3" />
                          {client.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className={`text-2xl font-bold ${client.totalRemainingSms < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formatNumber(client.totalRemainingSms)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 w-32 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                              <div className={`h-full rounded-full ${client.totalRemainingSms < 20 ? 'bg-linear-to-r from-red-500 to-red-400' : 'bg-linear-to-r from-emerald-500 to-teal-500'}`}
                                style={{ width: `${Math.min(100, (client.totalRemainingSms / 1000) * 100)}%` }} />
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
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-300 bg-[#1a1e26] px-4 py-2.5 rounded-xl border border-emerald-500/10">
                          <Users className="w-4 h-4 text-emerald-500/50" />
                          <span className="font-bold text-xl">{formatNumber(client.customerCount)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            client.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}>
                            {client.status === "active" ? "فعال" : "منقضی"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-2">
                          <button onClick={(e) => startEdit(client, e)} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition" title="ویرایش">
                            <Edit2 className="w-4 h-4" />
                            <span className="text-xs">ویرایش</span>
                          </button>
                          <button onClick={() => handleDelete(client)} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition" title="حذف">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-xs">حذف</span>
                          </button>
                          {!client.hasCompleteProfile && (
                            <button onClick={(e) => startEdit(client, e)} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition" title="تکمیل ثبت‌نام">
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

      {/* مودال جزئیات */}
      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}