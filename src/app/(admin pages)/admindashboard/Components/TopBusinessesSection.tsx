"use client";
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Phone,
  Briefcase,
  Award,
  ExternalLink,
  X,
  BarChart3,
  Clock,
  MessageSquare,
  DollarSign,
  PieChart,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TopBusiness {
  id: number;
  name: string;
  phone: string;
  job_title: string;
  plan_title: string;
  sms_balance: number;
  bookings_count: number;
  customer_count: number;
  cancellation_rate: number;
  recent_booking_date: string;
  growth: string;
  isPositiveGrowth: boolean;
}

interface BusinessDetails {
  id: number;
  name: string;
  phone: string;
  job_title: string;
  plan_title: string;
  registration_date: string;
  total_bookings: number;
  total_customers: number;
  cancellation_rate: number;
  sms_balance: number;
  purchased_sms_credit: number;
  recent_bookings: Array<{
    id: number;
    client_name: string;
    booking_date: string;
    booking_time: string;
    status: string;
    services: string;
    booking_description: string;
  }>;
  popular_services: Array<{
    name: string;
    booking_count: number;
  }>;
}

export function TopBusinessesSection() {
  const [businesses, setBusinesses] = useState<TopBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchTopBusinesses();
  }, []);

  const fetchTopBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dashboard/top-businesses?limit=10");
      const data = await res.json();
      
      if (data.success) {
        setBusinesses(data.businesses);
      } else {
        toast.error(data.message || "خطا در دریافت کسب‌وکارهای برتر");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessDetails = async (id: number) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard/top-businesses?id=${id}`);
      const data = await res.json();
      
      if (data.success) {
        setSelectedBusiness(data.business);
      } else {
        toast.error(data.message || "خطا در دریافت جزئیات");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Clock className="w-3 h-3" />
            فعال
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            تکمیل شده
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            لغو شده
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* بخش کسب‌وکارهای برتر */}
      <div className="bg-[#242933] border border-emerald-500/20 rounded-2xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            کسب‌وکارهای برتر دوره
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
              {businesses.length} مورد
            </span>
          </h3>
          <button
            onClick={fetchTopBusinesses}
            className="text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5" />
            بروزرسانی
          </button>
        </div>

        <div className="space-y-4">
          {businesses.length > 0 ? (
            businesses.map((business, idx) => (
              <div
                key={business.id}
                onClick={() => fetchBusinessDetails(business.id)}
                className="flex items-center justify-between p-4 bg-[#1a1e26] rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border ${
                    idx === 0 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 shadow-lg shadow-yellow-500/20' :
                    idx === 1 ? 'bg-gray-700/50 text-gray-300 border-gray-600/50' :
                    idx === 2 ? 'bg-amber-800/20 text-amber-400 border-amber-700/30' :
                    'bg-gray-800 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                      {business.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {business.job_title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {business.phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {formatNumber(business.bookings_count)}
                      <span className="text-xs text-gray-400 mr-1">نوبت</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatNumber(business.customer_count)} مشتری
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    business.isPositiveGrowth 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {business.growth}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">هیچ کسب‌وکاری با نوبت‌دهی یافت نشد</p>
            </div>
          )}
        </div>

        {businesses.length > 0 && (
          <div className="mt-6 pt-4 border-t border-emerald-500/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatNumber(businesses[0]?.bookings_count || 0)}</div>
                <div className="text-gray-400">رتبه اول</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-400">
                  {formatNumber(businesses.reduce((sum, biz) => sum + biz.bookings_count, 0))}
                </div>
                <div className="text-gray-400">کل نوبت‌ها</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">
                  {formatNumber(businesses.reduce((sum, biz) => sum + biz.customer_count, 0))}
                </div>
                <div className="text-gray-400">کل مشتریان</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-400">
                  {Math.round(businesses.reduce((sum, biz) => sum + biz.cancellation_rate, 0) / businesses.length)}%
                </div>
                <div className="text-gray-400">میانگین لغو</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* مودال جزئیات کسب‌وکار */}
      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#242933] border border-emerald-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {detailsLoading ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* هدر مودال */}
                <div className="flex items-center justify-between p-6 border-b border-emerald-500/20">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-6 h-6 text-emerald-400" />
                      جزئیات کسب‌وکار
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      اطلاعات کامل {selectedBusiness.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBusiness(null)}
                    className="p-2 rounded-lg hover:bg-white/10 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* محتوای مودال */}
                <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                  {/* اطلاعات اصلی */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Users className="w-4 h-4" />
                        <span className="text-xs">مشتریان</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatNumber(selectedBusiness.total_customers)}
                      </div>
                    </div>
                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">نوبت‌ها</span>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {formatNumber(selectedBusiness.total_bookings)}
                      </div>
                    </div>
                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <PieChart className="w-4 h-4" />
                        <span className="text-xs">نرخ لغو</span>
                      </div>
                      <div className={`text-2xl font-bold ${
                        selectedBusiness.cancellation_rate > 20 ? 'text-red-400' : 
                        selectedBusiness.cancellation_rate > 10 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {selectedBusiness.cancellation_rate}%
                      </div>
                    </div>
                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-400 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">پیامک باقیمانده</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {formatNumber(selectedBusiness.sms_balance + selectedBusiness.purchased_sms_credit)}
                      </div>
                    </div>
                  </div>

                  {/* اطلاعات تماس و پلن */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-400" />
                        اطلاعات تماس
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">نام کسب‌وکار:</span>
                          <span className="font-bold text-white">{selectedBusiness.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">شماره تماس:</span>
                          <span className="font-mono text-white">{selectedBusiness.phone}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">شغل:</span>
                          <span className="text-emerald-400">{selectedBusiness.job_title}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-400">تاریخ ثبت‌نام:</span>
                          <span className="text-gray-300">{formatDate(selectedBusiness.registration_date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        اطلاعات پلن و خدمات
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">پلن فعلی:</span>
                          <span className={`font-bold ${
                            selectedBusiness.plan_title === 'طلایی' ? 'text-yellow-400' :
                            selectedBusiness.plan_title === 'پلن پایه' ? 'text-blue-400' :
                            'text-emerald-400'
                          }`}>
                            {selectedBusiness.plan_title}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">پیامک پلن:</span>
                          <span className="text-white">{formatNumber(selectedBusiness.sms_balance)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-gray-400">پیامک خریداری‌شده:</span>
                          <span className="text-emerald-400">{formatNumber(selectedBusiness.purchased_sms_credit)}</span>
                        </div>
                        {selectedBusiness.popular_services.length > 0 && (
                          <div className="pt-2">
                            <span className="text-gray-400 block mb-2">خدمات محبوب:</span>
                            <div className="flex flex-wrap gap-2">
                              {selectedBusiness.popular_services.map((service, idx) => (
                                <span key={idx} className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                  {service.name} ({service.booking_count})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* نوبت‌های اخیر */}
                  <div className="bg-[#1a1e26] border border-emerald-500/20 rounded-xl p-5">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      آخرین نوبت‌ها
                    </h4>
                    {selectedBusiness.recent_bookings.length > 0 ? (
                      <div className="space-y-3">
                        {selectedBusiness.recent_bookings.map((booking) => (
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
                </div>

                {/* فوتر مودال */}
                <div className="p-4 border-t border-emerald-500/20 bg-[#1a1e26] flex justify-between items-center">
                  <button
                    onClick={() => window.location.href = `/admin/clients/${selectedBusiness.id}`}
                    className="text-sm text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    مشاهده پروفایل کامل
                  </button>
                  <div className="text-xs text-gray-400">
                    آخرین بروزرسانی: {new Date().toLocaleTimeString('fa-IR')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}