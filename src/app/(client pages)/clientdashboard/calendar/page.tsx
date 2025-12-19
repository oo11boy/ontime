"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Plus, Filter } from "lucide-react";
import Footer from "../components/Footer/Footer";
import { gregorianToPersian, getTodayJalali } from "@/lib/date-utils";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import BulkSmsModal from "./components/BulkSmsModal";
import FilterModal from "./components/FilterModal";
import CalendarDayCard from "./components/CalendarDayCard";
import { useBookings } from "@/hooks/useBookings";
import { useServices } from "@/hooks/useServices";
import { useSmsBalance } from "@/hooks/useDashboard";
import { Appointment } from "@/types";
import { HeaderSection } from "./components/HeaderSection";

// نام‌های فارسی کامل ماه‌ها (0-indexed: فروردین = 0)
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد',
  'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر',
  'دی', 'بهمن', 'اسفند'
];

interface CalendarDay {
  date: Date;
  jalaliDate: {
    year: number;
    month: number; // 0-indexed
    day: number;
    monthName: string;
  };
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean; // فقط جمعه
  appointments: Appointment[];
  hasAppointments: boolean;
}

// اینترفیس برای Service
interface Service {
  id: number;
  name: string;
  is_active: boolean;
  duration_minutes?: number;
  price?: number;
}

export default function CalendarPage() {
  const router = useRouter();

  // React Query Hooks
  const {
    data: bookingsData,
    isLoading,
    refetch: refetchAppointments,
  } = useBookings();
  const { data: servicesData } = useServices();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();

  const allAppointments = useMemo(
    () => bookingsData?.bookings || [],
    [bookingsData]
  );
  
  const services: Service[] = useMemo(() => {
    if (!servicesData?.services) return [];
    return servicesData.services as Service[];
  }, [servicesData]);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [selectedDayForSms, setSelectedDayForSms] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string>("all");

  // دریافت تاریخ امروز به شمسی
  const todayJalali = useMemo(() => getTodayJalali(), []);

  const dynamicServices = useMemo(() => {
    const serviceNames = services
      .filter((service: Service) => service.is_active)
      .map((service: Service) => service.name);
    
    console.log("سرویس‌های فعال:", serviceNames);
    return [ ...serviceNames];
  }, [services]);

  const updateAppointmentsStatus = useCallback(async () => {
    try {
      await fetch("/api/client/bookings/update-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      refetchAppointments();
    } catch (error) {
      console.error("Error updating appointments:", error);
    }
  }, [refetchAppointments]);

  // فیلتر کردن نوبت‌ها بر اساس خدمات انتخاب شده
  const filteredAppointments = useMemo(() => {
    console.log("فیلتر خدمات:", selectedService);
    console.log("کل نوبت‌ها:", allAppointments.length);
    console.log("لیست سرویس‌ها برای فیلتر:", dynamicServices);
    
    if (selectedService === "all") {
      console.log("همه خدمات انتخاب شده - برگرداندن همه نوبت‌ها");
      return allAppointments;
    }
    
    const filtered = allAppointments.filter((app) => {
      // بررسی کنیم که services رشته است یا آرایه
      let serviceList: string[] = [];
      
      if (!app.services) {
        console.log(`نوبت ${app.id}: بدون خدمات`);
        return false; // اگر سرویسی ندارد، نادیده بگیر
      }
      
      console.log(`نوبت ${app.id} - services نوع:`, typeof app.services, "مقدار:", app.services);
      
      if (typeof app.services === 'string') {
        // اگر services رشته است، با کاما جدا کنیم
        serviceList = app.services.split(',').map((s: string) => s.trim());
      } else if (Array.isArray(app.services)) {
        // اگر services آرایه است
        serviceList = (app.services as any[]).map((s: any) => String(s).trim());
      } else {
        // اگر نوع دیگری است، به رشته تبدیل کنیم
        serviceList = [String(app.services).trim()];
      }
      
      console.log(`نوبت ${app.id} - لیست سرویس‌ها:`, serviceList);
      
      // بررسی وجود سرویس در لیست (با حذف فاصله و مقایسه دقیق)
      const normalizedSelectedService = selectedService.trim();
      const hasService = serviceList.some((service: string) => {
        const normalizedService = service.trim();
        const match = normalizedService === normalizedSelectedService;
        console.log(`  مقایسه: "${normalizedService}" با "${normalizedSelectedService}" => ${match}`);
        return match;
      });
      
      console.log(`نوبت ${app.id} - سرویس دارد؟ ${hasService}`);
      
      return hasService;
    });
    
    console.log("نوبت‌های فیلتر شده:", filtered.length);
    
    return filtered;
  }, [allAppointments, selectedService, dynamicServices]);

  // Generate calendar days based on filtered appointments
  useEffect(() => {
    const generateCalendar = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // استخراج تاریخ‌های منحصر به فرد از نوبت‌های فیلتر شده
      const uniqueDates = new Set<string>();
      
      filteredAppointments.forEach((app) => {
        uniqueDates.add(app.booking_date);
      });

      // تبدیل رشته‌های تاریخ به Date و مرتب‌سازی
      const sortedDates = Array.from(uniqueDates)
        .map((dateStr) => {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);
          return date;
        })
        .sort((a, b) => a.getTime() - b.getTime())
        .slice(0, 30);

      const days: CalendarDay[] = [];

      sortedDates.forEach((date) => {
        const persianDate = gregorianToPersian(date);
        const isWeekend = persianDate.weekDay === 'جمعه';
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;

        // فقط نوبت‌های فیلتر شده را برای این تاریخ بگیر
        const dayAppointments = filteredAppointments.filter((app) => {
          const appDate = new Date(app.booking_date);
          appDate.setHours(0, 0, 0, 0);
          return appDate.getTime() === date.getTime();
        });

        // فقط روزهایی که حداقل یک نوبت دارند را نمایش بده
        if (dayAppointments.length > 0) {
          days.push({
            date,
            jalaliDate: {
              year: persianDate.year,
              month: persianDate.month,
              day: persianDate.day,
              monthName: persianDate.monthName,
            },
            isToday,
            isPast,
            isWeekend,
            appointments: dayAppointments,
            hasAppointments: dayAppointments.length > 0,
          });
        }
      });

      console.log("روزهای تقویم تولید شده:", days.length);

      setCalendarDays(days);
    };

    generateCalendar();
  }, [filteredAppointments]);

  const handleCancelAppointment = useCallback((id: number) => {
    console.log("Cancel appointment:", id);
  }, []);

  const handleSendBulkSms = useCallback(
    async (message: string, appointmentIds: number[]) => {
      try {
        const response = await fetch("/api/bulk-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointmentIds, message }),
        });

        const result = await response.json();
        if (response.ok && result.success) {
          toast.success(
            `پیام با موفقیت برای ${appointmentIds.length} نفر ارسال شد`
          );
          await refetchAppointments();
        } else {
          toast.error(result.message || "خطا در ارسال پیام همگانی");
        }
      } catch (error: any) {
        console.error("Error sending bulk SMS:", error);
        toast.error(error.message || "خطا در ارتباط با سرور");
      }
    },
    [refetchAppointments]
  );

  const getDayName = useCallback((date: Date) => {
    const persianDate = gregorianToPersian(date);
    return persianDate.weekDay;
  }, []);

  const handleBulkSmsClick = useCallback(
    (date: Date, dayAppointments: Appointment[]) => {
      const activeAppointments = dayAppointments.filter(
        (app) => app.status === "active"
      );
      if (activeAppointments.length === 0) {
        toast.error("برای این روز هیچ نوبت فعالی وجود ندارد");
        return;
      }
      setSelectedDayForSms(date);
      setShowBulkSmsModal(true);
    },
    []
  );

  const handleAddAppointment = useCallback(
    (date: Date) => {
      const persianDate = gregorianToPersian(date);
      // ماه باید +1 شود چون در URL ماه 1-indexed است
      const jalaliDateStr = `${persianDate.year}/${persianDate.month + 1}/${persianDate.day}`;
      router.push(
        `/clientdashboard/bookingsubmit?date=${encodeURIComponent(
          jalaliDateStr
        )}`
      );
    },
    [router]
  );

  const handleRefresh = useCallback(() => {
    updateAppointmentsStatus();
    refetchAppointments();
  }, [updateAppointmentsStatus, refetchAppointments]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDayForSms) return [];
    return (
      calendarDays.find(
        (day) => day.date.toDateString() === selectedDayForSms.toDateString()
      )?.appointments || []
    );
  }, [selectedDayForSms, calendarDays]);

  // تعداد کل نوبت‌های فیلتر شده
  const totalFilteredAppointments = filteredAppointments.length;


  // بررسی اینکه آیا فیلتر فعال است
  const isFilterActive = selectedService !== "all";

  return (
   <div className="min-h-screen text-white max-w-md mx-auto relative">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <HeaderSection
          userSmsBalance={userSmsBalance}
          isLoadingBalance={isLoadingBalance}
          isLoading={isLoading}
          selectedService={selectedService}
          filteredAppointments={filteredAppointments}
          onRefresh={handleRefresh}
          onFilterClick={() => setShowFilterModal(true)}
          onAddAppointment={() => {
            const todayStr = `${todayJalali.year}/${todayJalali.month + 1}/${todayJalali.day}`;
            router.push(`/clientdashboard/bookingsubmit?date=${encodeURIComponent(todayStr)}`);
          }}
          onClearFilter={() => {
            setSelectedService("all");
            toast.success("فیلتر حذف شد");
          }}
        />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-2xl border border-white/10 p-5 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-24"></div>
                      <div className="h-3 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-white/10 rounded-xl w-32"></div>
                </div>
                <div className="h-20 bg-white/10 rounded-xl"></div>
              </div>
            ))
          ) : calendarDays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400 mb-2">
                {isFilterActive ? 'هیچ نوبتی با این خدمت یافت نشد' : 'هیچ نوبتی یافت نشد'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {isFilterActive 
                  ? 'می‌توانید خدمت دیگری انتخاب کنید یا اولین نوبت را ثبت کنید'
                  : 'می‌توانید اولین نوبت را ثبت کنید'}
              </p>
              <div className="flex flex-col gap-3">
                {isFilterActive && (
                  <button
                    onClick={() => setSelectedService("all")}
                    className="bg-linear-to-r from-blue-500 to-blue-600 rounded-xl px-6 py-3 font-bold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Filter className="w-5 h-5" /> حذف فیلتر
                  </button>
                )}
                <button
                  onClick={() => {
                    const todayStr = `${todayJalali.year}/${todayJalali.month + 1}/${todayJalali.day}`;
                    router.push(`/clientdashboard/bookingsubmit?date=${encodeURIComponent(todayStr)}`);
                  }}
                  className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> ثبت اولین نوبت
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* نمایش اطلاعات فیلتر */}
              {isFilterActive && (
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="font-bold text-sm">فیلتر فعال</h3>
                        <p className="text-xs text-gray-300">
                          <span className="ml-2">خدمت: {selectedService}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">
                        {totalFilteredAppointments} نوبت ({calendarDays.length} روز)
                      </p>
                      <button
                        onClick={() => setSelectedService("all")}
                        className="text-xs text-blue-400 hover:text-blue-300 mt-1"
                      >
                        حذف فیلتر
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* نمایش روزهای تقویم */}
              {calendarDays.map((day, index) => (
                <CalendarDayCard
                  key={index}
                  day={day}
                  getDayName={getDayName}
                  onAddAppointment={() => handleAddAppointment(day.date)}
                  onBulkSmsClick={() =>
                    handleBulkSmsClick(day.date, day.appointments)
                  }
                  onAppointmentClick={setSelectedAppointment}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <Footer />
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={handleCancelAppointment}
        />
      )}
      {dynamicServices.length > 0 && (
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          services={dynamicServices}
        />
      )}
      {selectedDayForSms && (
        <BulkSmsModal
          isOpen={showBulkSmsModal}
          onClose={() => {
            setShowBulkSmsModal(false);
            setSelectedDayForSms(null);
          }}
          date={selectedDayForSms}
          appointments={appointmentsForSelectedDay}
          userSmsBalance={userSmsBalance}
          onSend={handleSendBulkSms}
        />
      )}
    </div>
  );
}