"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, ChevronLeft, ChevronRight, X, Eye, EyeOff } from "lucide-react";
import Footer from "../components/Footer/Footer";
import { gregorianToPersian, getTodayJalali } from "@/lib/date-utils";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import FilterModal from "./components/FilterModal";
import CalendarDayCard from "./components/CalendarDayCard";
import { useBookings } from "@/hooks/useBookings";
import { useServices } from "@/hooks/useServices";
import { Appointment } from "@/types";
import { HeaderSection } from "./components/HeaderSection";
import { useSmsBalance } from "@/hooks/useSmsBalance";
import { useSendBulkSms } from "@/hooks/useSendSms";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BulkSmsModal } from "../BulkSmsModal";
import { useUserType } from "@/hooks/useUserType";
import { useDashboard } from "@/hooks/useDashboard";

interface Service {
  id: number;
  name: string;
  is_active: boolean;
}

interface CalendarDay {
  date: Date;
  jalaliDate: {
    year: number;
    month: number;
    day: number;
    monthName: string;
    weekDay: string;
  };
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  appointments: Appointment[];
  hasAppointments: boolean;
}

export default function CalendarPage() {
  const { userType, staffId, staffName } = useUserType();
  const { data: dashboardData } = useDashboard();
  const router = useRouter();
  const queryClient = useQueryClient();

  const staffCalendarType = dashboardData?.user?.calendar_type;

  const {
    data: bookingsData,
    isLoading,
    isFetching,
    refetch: refetchAppointments,
  } = useBookings();
  const { data: servicesData } = useServices();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } =
    useSmsBalance();
  const { mutateAsync: sendBulkSms } = useSendBulkSms();

  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/client/settings");
      return res.json();
    },
  });

  const allAppointments = useMemo(
    () => (bookingsData?.bookings as Appointment[]) || [],
    [bookingsData],
  );
  const services: Service[] = useMemo(
    () => (servicesData?.services as Service[]) || [],
    [servicesData],
  );

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [selectedDayForSms, setSelectedDayForSms] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string>("all");
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCancelledFuture, setShowCancelledFuture] = useState(false);

  const todayJalali = useMemo(() => getTodayJalali(), []);

  const handleUpdateBusinessProfile = async (
    newName: string,
    newAddress: string,
  ) => {
    try {
      const response = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData?.user,
          business_name: newName,
          business_address: newAddress,
        }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("اطلاعات با موفقیت بروزرسانی شد");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Update error:", error);
      return false;
    }
  };

  const filteredByService = useMemo(() => {
    if (selectedService === "all") return allAppointments;
    return allAppointments.filter((app) => {
      const serviceList: string[] =
        typeof app.services === "string"
          ? (app.services as string).split(",").map((s: string) => s.trim())
          : Array.isArray(app.services)
            ? (app.services as any[]).map((s: any) => String(s).trim())
            : [];
      return serviceList.some((s: string) => s === selectedService.trim());
    });
  }, [allAppointments, selectedService]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // نوبت‌های آینده (امروز و بعد)
  const futureAppointments = useMemo(() => {
    return filteredByService.filter((app) => {
      const appDate = new Date(app.booking_date);
      appDate.setHours(0, 0, 0, 0);
      return appDate >= today;
    });
  }, [filteredByService]);

  // اعمال فیلتر کنسل شده فقط برای نوبت‌های آینده
  const filteredFutureAppointments = useMemo(() => {
    if (showCancelledFuture) return futureAppointments;
    return futureAppointments.filter((app) => app.status !== "cancelled");
  }, [futureAppointments, showCancelledFuture]);

  // نوبت‌های نهایی برای نمایش
  const finalDisplayAppointments = useMemo(() => {
    if (selectedDate) {
      // اگر تاریخ انتخاب شده: همه نوبت‌های آن روز (شامل گذشته و کنسل شده)
      return filteredByService.filter(
        (app) => new Date(app.booking_date).toDateString() === selectedDate.toDateString()
      );
    }
    // پیش‌فرض: فقط نوبت‌های آینده (با احتساب فیلتر کنسل شده)
    return filteredFutureAppointments;
  }, [filteredFutureAppointments, selectedDate, filteredByService]);

  useEffect(() => {
    const generateCalendar = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const uniqueDates = new Set<string>();
      finalDisplayAppointments.forEach((app) => uniqueDates.add(app.booking_date));

      const days: CalendarDay[] = Array.from(uniqueDates)
        .map((d) => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => {
          date.setHours(0, 0, 0, 0);
          const persian = gregorianToPersian(date);
          const dayApps = finalDisplayAppointments.filter(
            (app) =>
              new Date(app.booking_date).toDateString() === date.toDateString(),
          );
          return {
            date,
            jalaliDate: { ...persian },
            isToday: date.toDateString() === today.toDateString(),
            isPast:
              date < today && date.toDateString() !== today.toDateString(),
            isWeekend: persian.weekDay === "جمعه",
            appointments: dayApps,
            hasAppointments: dayApps.length > 0,
          };
        });
      setCalendarDays(days);
    };
    generateCalendar();
  }, [finalDisplayAppointments]);

  const handleSendBulkSms = async (
    templateKey: string,
    appointmentIds: (string | number)[],
  ) => {
    const recipients = appointmentIds
      .map((id) => {
        const app = allAppointments.find((a) => a.id === id);
        return { phone: app?.client_phone || "", name: app?.client_name || "" };
      })
      .filter((r) => r.phone);

    await sendBulkSms({
      recipients,
      templateKey,
      sms_type: "bulk_appointments",
    });
    refetchAppointments();
  };

  const appointmentsForSms = useMemo(() => {
    if (!selectedDayForSms) return [];
    const day = calendarDays.find(
      (d) => d.date.toDateString() === selectedDayForSms.toDateString(),
    );
    return (day?.appointments || [])
      .filter((app: Appointment) => app.status === "active")
      .map((app: Appointment) => ({
        id: app.id,
        name: app.client_name,
        details: `${app.booking_time} - ${app.services}`,
      }));
  }, [selectedDayForSms, calendarDays]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    const persian = gregorianToPersian(date);
    toast.success(`نمایش نوبت‌های ${persian.day} ${persian.monthName}`);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
    toast.success("نمایش نوبت‌های جاری");
  };

  const goToToday = () => {
    handleDateSelect(new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayWeekday = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const hasAppointmentOnDate = (date: Date) => {
    return allAppointments.some(
      (app) => new Date(app.booking_date).toDateString() === date.toDateString()
    );
  };

  const getAppointmentCountOnDate = (date: Date) => {
    return allAppointments.filter(
      (app) => new Date(app.booking_date).toDateString() === date.toDateString()
    ).length;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-[#1a1e26] dark:to-[#242933] text-slate-800 dark:text-white max-w-md mx-auto relative transition-colors">
      <Toaster position="top-center" />
      <div className="min-h-screen pb-32">
        <HeaderSection
    
          isLoading={isLoading || isFetching}
          selectedService={selectedService}
          filteredAppointments={filteredByService}
          onRefresh={() => refetchAppointments()}
          onFilterClick={() => setShowFilterModal(true)}
          onAddAppointment={() =>
            router.push(
              `/clientdashboard/bookingsubmit?date=${encodeURIComponent(
                `${todayJalali.year}/${todayJalali.month + 1}/${todayJalali.day}`,
              )}`,
            )
          }
          onClearFilter={() => setSelectedService("all")}
        />

        {/* دکمه‌ها */}
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedDate
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white dark:bg-white/10 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {selectedDate 
                ? `${gregorianToPersian(selectedDate).day} ${gregorianToPersian(selectedDate).monthName}`
                : 'انتخاب تاریخ'}
            </button>
            
            {!selectedDate && (
              <button
                onClick={() => setShowCancelledFuture(!showCancelledFuture)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showCancelledFuture
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white dark:bg-white/10 text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-gray-700'
                }`}
              >
                {showCancelledFuture ?  <EyeOff className="w-4 h-4" />: <Eye className="w-4 h-4" /> }
                {showCancelledFuture ?'مخفی کردن نوبت‌های کنسل شده': 'نمایش نوبت‌های کنسل شده' }
              </button>
            )}
            
            {selectedDate && (
              <button
                onClick={clearDateFilter}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
              >
                <X className="w-4 h-4" />
                نمایش جاری
              </button>
            )}
          </div>
        </div>

        {/* تقویم انتخاب تاریخ */}
        {showDatePicker && (
          <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDatePicker(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-lg">انتخاب تاریخ</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="font-bold">
                    {gregorianToPersian(currentMonth).monthName} {currentMonth.getFullYear()}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-slate-500">
                  {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, i) => (
                    <div key={i} className="py-1 font-medium">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(currentMonth).map((day, idx) => {
                    const persian = gregorianToPersian(day.date);
                    const hasApp = hasAppointmentOnDate(day.date);
                    const appCount = getAppointmentCountOnDate(day.date);
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDateSelect(day.date)}
                        className={`
                          aspect-square rounded-xl text-sm font-medium transition-all
                          ${!day.isCurrentMonth && 'opacity-30'}
                          ${isSelected && 'bg-emerald-500 text-white shadow-lg scale-95'}
                          ${isToday && !isSelected && 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20'}
                          ${hasApp && !isSelected && !isToday && 'bg-emerald-100 dark:bg-emerald-500/10'}
                          hover:scale-105 hover:shadow-md
                        `}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-sm">{persian.day}</span>
                          {hasApp && (
                            <span className="text-[10px] mt-0.5 font-normal">
                              {appCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={goToToday}
                  className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
                >
                  امروز
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {isLoading ? (
            <div className="text-center py-10 opacity-50 text-sm text-slate-500 dark:text-gray-400">
              در حال بارگذاری نوبت‌ها...
            </div>
          ) : calendarDays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-500 dark:text-gray-400">
                نوبتی یافت نشد
              </h3>
            </div>
          ) : (
            calendarDays.map((day, idx) => (
              <CalendarDayCard
                key={idx}
                day={day}
                getDayName={(d) => gregorianToPersian(d).weekDay}
                onAddAppointment={() =>
                  router.push(
                    `/clientdashboard/bookingsubmit?date=${encodeURIComponent(
                      `${day.jalaliDate.year}/${day.jalaliDate.month + 1}/${day.jalaliDate.day}`,
                    )}`,
                  )
                }
                onBulkSmsClick={() => {
                  setSelectedDayForSms(day.date);
                  setShowBulkSmsModal(true);
                }}
                onAppointmentClick={setSelectedAppointment}
              />
            ))
          )}
        </div>
      </div>
      <Footer userType={userType} />

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCancel={() => refetchAppointments()}
        />
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        services={services.filter((s) => s.is_active).map((s) => s.name)}
      />

      <BulkSmsModal
        isOpen={showBulkSmsModal}
        onClose={() => {
          setShowBulkSmsModal(false);
          setSelectedDayForSms(null);
        }}
        title={`اطلاع‌رسانی نوبت‌های ${
          selectedDayForSms
            ? gregorianToPersian(selectedDayForSms).day +
              " " +
              gregorianToPersian(selectedDayForSms).monthName
            : ""
        }`}
        recipients={appointmentsForSms}
        userSmsBalance={userSmsBalance}
        businessName={userData?.user?.business_name || null}
        businessAddress={userData?.user?.business_address || null}
        onSend={handleSendBulkSms}
        onUpdateBusinessProfile={handleUpdateBusinessProfile}
      />
    </div>
  );
}