// File: src/components/admin/ClientDetailsModal.tsx
"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  Calendar,
  Phone,
  Briefcase,
  Award,
  BarChart3,
  Clock,
  MessageSquare,
  DollarSign,
  PieChart,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Target,
  Mail,
  MapPin,
  CreditCard,
  TrendingUp,
  Shield,
  Star,
  FileText,
  Percent,
  Activity
} from "lucide-react";
import { toast } from "react-hot-toast";

interface ClientDetails {
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
  // اطلاعات اضافی از API کسب‌وکارهای برتر
  total_bookings?: number;
  cancellation_rate?: number;
  recent_bookings?: Array<{
    id: number;
    client_name: string;
    booking_date: string;
    booking_time: string;
    status: string;
    services: string;
    booking_description: string;
  }>;
  popular_services?: Array<{
    name: string;
    booking_count: number;
  }>;
}

interface ClientDetailsModalProps {
  client: {
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
  onClose: () => void;
}

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'sms' | 'analytics'>('overview');

  useEffect(() => {
    fetchClientDetails();
  }, [client.id]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      // دریافت اطلاعات کامل از API کسب‌وکارهای برتر
      const res = await fetch(`/api/admin/dashboard/top-businesses?id=${client.id}`);
      const data = await res.json();
      
      if (data.success) {
        // ترکیب اطلاعات موجود با اطلاعات جدید
        setDetails({
          ...client,
          total_bookings: data.business.total_bookings || 0,
          cancellation_rate: data.business.cancellation_rate || 0,
          recent_bookings: data.business.recent_bookings || [],
          popular_services: data.business.popular_services || []
        });
      } else {
        // اگر اطلاعات کامل دریافت نشد، همان اطلاعات اولیه را نمایش می‌دهیم
        setDetails({
          ...client,
          total_bookings: 0,
          cancellation_rate: 0,
          recent_bookings: [],
          popular_services: []
        });
      }
    } catch (err) {
      toast.error("خطا در دریافت جزئیات");
      // در صورت خطا، اطلاعات اولیه را نمایش می‌دهیم
      setDetails({
        ...client,
        total_bookings: 0,
        cancellation_rate: 0,
        recent_bookings: [],
        popular_services: []
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
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            فعال
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            تکمیل شده
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            لغو شده
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'طلایی':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Award className="w-3 h-3" />
            {plan}
          </span>
        );
      case 'پلن پایه':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Shield className="w-3 h-3" />
            {plan}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {plan}
          </span>
        );
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        
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
                    <XCircle className="w-3 h-3" />
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
                <span className={`flex items-center gap-1 ${
                  details.status === "active" ? "text-emerald-400" : "text-red-400"
                }`}>
                  <Activity className="w-3 h-3" />
                  {details.status === "active" ? "فعال" : "منقضی"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* تب‌های ناوبری */}
        <div className="border-b border-emerald-500/10">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Users className="inline-block w-4 h-4 ml-2" />
              اطلاعات کلی
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Calendar className="inline-block w-4 h-4 ml-2" />
              نوبت‌ها و خدمات
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'sms'
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <MessageSquare className="inline-block w-4 h-4 ml-2" />
              پیامک و اعتبار
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'analytics'
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <BarChart3 className="inline-block w-4 h-4 ml-2" />
              آمار و تحلیل
            </button>
          </div>
        </div>

        {/* محتوای تب‌ها */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          
          {/* تب اطلاعات کلی */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* کارت‌های آمار سریع */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">مشتریان</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(details.customerCount)}
                  </div>
                </div>
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">کل نوبت‌ها</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatNumber(details.total_bookings || 0)}
                  </div>
                </div>
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <PieChart className="w-4 h-4" />
                    <span className="text-xs">نرخ لغو</span>
                  </div>
                  <div className={`text-2xl font-bold ${
                    (details.cancellation_rate || 0) > 20 ? 'text-red-400' : 
                    (details.cancellation_rate || 0) > 10 ? 'text-yellow-400' : 'text-emerald-400'
                  }`}>
                    {(details.cancellation_rate || 0)}%
                  </div>
                </div>
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">پیامک باقیمانده</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {formatNumber(details.totalRemainingSms)}
                  </div>
                </div>
              </div>

              {/* اطلاعات تماس */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    اطلاعات تماس
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">نام کسب‌وکار:</span>
                      <span className="font-bold text-white">{details.businessName}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">شماره تماس:</span>
                      <span className="font-mono text-white">{details.phone}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">شغل:</span>
                      <span className="text-emerald-400">{details.jobTitle}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400">تاریخ ثبت‌نام:</span>
                      <span className="text-gray-300">{formatDate(details.registrationDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    اطلاعات پلن
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">پلن فعلی:</span>
                      {getPlanBadge(details.plan)}
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">وضعیت:</span>
                      <span className={`font-bold ${
                        details.status === "active" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {details.status === "active" ? "فعال" : "منقضی"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400">پروفایل:</span>
                      <span className={`font-bold ${
                        details.hasCompleteProfile ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        {details.hasCompleteProfile ? "کامل" : "ناقص"}
                      </span>
                    </div>
                    <div className="pt-2">
                      <span className="text-gray-400 block mb-2">کیفیت پروفایل:</span>
                      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            details.hasCompleteProfile ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: details.hasCompleteProfile ? '100%' : '60%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب نوبت‌ها و خدمات */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* خدمات محبوب */}
              {details.popular_services && details.popular_services.length > 0 && (
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    خدمات محبوب
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {details.popular_services.map((service, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                        <span className="text-emerald-400 font-medium">{service.name}</span>
                        <span className="text-xs text-gray-400">({formatNumber(service.booking_count)} نوبت)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* آخرین نوبت‌ها */}
              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  آخرین نوبت‌ها
                </h4>
                {details.recent_bookings && details.recent_bookings.length > 0 ? (
                  <div className="space-y-3">
                    {details.recent_bookings.map((booking) => (
                      <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-[#242933] rounded-lg border border-white/5 hover:border-emerald-500/20 transition">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                              {booking.client_name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-white">{booking.client_name}</div>
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

              {/* آمار نوبت‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">کل نوبت‌ها</span>
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(details.total_bookings || 0)}</div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">میانگین ماهانه</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(Math.round((details.total_bookings || 0) / 3))}</div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">نرخ تکمیل</span>
                    <Percent className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {100 - (details.cancellation_rate || 0)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب پیامک و اعتبار */}
          {activeTab === 'sms' && (
            <div className="space-y-6">
              {/* کارت اعتبار پیامک */}
              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  وضعیت اعتبار پیامک
                </h4>
                
                <div className="flex flex-col items-center mb-6">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="#334155"
                        strokeWidth="10"
                        fill="none"
                        opacity="0.6"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        stroke="#10B981"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={339.292}
                        strokeDashoffset={339.292 - ((details.totalRemainingSms / 1000) * 339.292)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          details.totalRemainingSms < 20 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
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
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">پلن ماهانه</span>
                    </div>
                    <div className="text-xl font-bold text-white">
                      {formatNumber(details.planBalance)}
                    </div>
                  </div>
                  <div className="bg-[#242933] border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">بسته‌های خریداری شده</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {formatNumber(details.purchasedPackagesBalance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* تحلیل مصرف */}
              <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  تحلیل مصرف پیامک
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">میانگین مصرف روزانه</span>
                      <span className="font-bold text-white">~{Math.round(details.total_bookings || 0 / 30)} پیامک</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, ((details.total_bookings || 0) / 30) / 10 * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">اعتبار باقیمانده (روز)</span>
                      <span className={`font-bold ${
                        (details.totalRemainingSms / ((details.total_bookings || 0) / 30)) < 7 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        ~{Math.round(details.totalRemainingSms / ((details.total_bookings || 0) / 30 + 1))} روز
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (details.totalRemainingSms / ((details.total_bookings || 0) / 30)) < 7 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (details.totalRemainingSms / 1000) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* تب آمار و تحلیل */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* نمودارهای تحلیل */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    روند نوبت‌دهی
                  </h4>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[30, 45, 25, 60, 80, 95, 50].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500/40 transition"
                          style={{ height: `${value}%` }}
                        />
                        <span className="text-[10px] text-gray-500">روز {idx + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    توزیع وضعیت نوبت‌ها
                  </h4>
                  <div className="flex items-center justify-center h-48">
                    <div className="relative">
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
              </div>

              {/* کارت‌های تحلیل پیشرفته */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs">رضایت مشتری</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">85%</div>
                  <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">رشد ماهانه</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">+12%</div>
                  <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">مشتریان وفادار</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">42%</div>
                  <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>
                <div className="bg-[#242933] border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">کارایی سیستم</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">92%</div>
                  <div className="w-full h-1 bg-gray-700/50 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* فوتر مودال */}
        <div className="p-4 border-t border-emerald-500/20 bg-[#1a1e26] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-400">
            آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
            <span className="mr-4">•</span>
            شناسه: {details.id}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = `/admin/clients/${details.id}/edit`}
              className="text-sm text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              ویرایش پروفایل
            </button>
            <button
              onClick={() => window.location.href = `/admin/clients/${details.id}/bookings`}
              className="text-sm text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              مشاهده نوبت‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}