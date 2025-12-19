"use client";
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar, Plus } from "lucide-react";
import Footer from "../components/Footer/Footer";
import { gregorianToPersian } from "@/lib/date-utils";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import BulkSmsModal from "./components/BulkSmsModal";
import FilterModal from "./components/FilterModal";
import CalendarDayCard from "./components/CalendarDayCard";
import HeaderSection from "./components/HeaderSection";
import { useBookings } from "@/hooks/useBookings";
import { useServices } from "@/hooks/useServices";
import { useSmsBalance } from "@/hooks/useDashboard";
import { Appointment } from "@/types";

interface CalendarDay {
  date: Date;
  jalaliDate: {
    year: number;
    month: number;
    day: number;
    monthName: string;
  };
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  appointments: Appointment[];
  hasAppointments: boolean;
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

  const appointments = useMemo(
    () => bookingsData?.bookings || [],
    [bookingsData]
  );
  const services = useMemo(() => servicesData?.services || [], [servicesData]);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [selectedDayForSms, setSelectedDayForSms] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    status: "all" as "all" | "active" | "cancelled" | "done",
    service: "all",
  });

  const dynamicServices = useMemo(() => {
    const serviceNames = services
      .filter((service: any) => service.is_active)
      .map((service: any) => service.name);
    return ["همه خدمات", ...serviceNames];
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

  // Generate calendar days
  useMemo(() => {
    const generateCalendar = () => {
      const uniqueDates = new Set<string>();
      appointments.forEach((app) => {
        if (app.status === "active") {
          uniqueDates.add(app.booking_date);
        }
      });

      const sortedDates = Array.from(uniqueDates)
        .map((dateStr) => new Date(dateStr))
        .sort((a, b) => a.getTime() - b.getTime())
        .slice(0, 30);

      if (sortedDates.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        sortedDates.push(today, tomorrow);
      }

      const days: CalendarDay[] = [];
      const today = new Date();

      sortedDates.forEach((date) => {
        const persianDate = gregorianToPersian(date);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today && !isToday;

        const dayAppointments = appointments.filter((app) => {
          const appDate = new Date(app.booking_date);
          return appDate.toDateString() === date.toDateString();
        });

        const hasActiveAppointments = dayAppointments.some(
          (app) => app.status === "active"
        );

        if (hasActiveAppointments || dayAppointments.length > 0) {
          days.push({
            date,
            jalaliDate: {
              year: persianDate.year,
              month: persianDate.month - 1,
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

      setCalendarDays(days);
    };

    generateCalendar();
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (filters.status !== "all" && app.status !== filters.status) {
        return false;
      }
      if (
        filters.service !== "all" &&
        !app.services?.includes(filters.service)
      ) {
        return false;
      }
      return true;
    });
  }, [appointments, filters.status, filters.service]);

  const handleCancelAppointment = useCallback((id: number) => {
    // This should be implemented as a mutation
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
      const jalaliDateStr = `${persianDate.year}/${persianDate.month}/${persianDate.day}`;
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

  return (
   <div className="min-h-screen text-white max-w-md mx-auto relative">
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <HeaderSection
          userSmsBalance={userSmsBalance}
          isLoadingBalance={isLoadingBalance}
          isLoading={isLoading}
          filters={filters}
          filteredAppointments={filteredAppointments}
          onRefresh={handleRefresh}
          onFilterClick={() => setShowFilterModal(true)}
          onAddAppointment={() => router.push("/clientdashboard/bookingsubmit")}
          onClearFilter={() => setFilters({ ...filters, status: "all" })}
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
                هیچ نوبتی یافت نشد
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                می‌توانید اولین نوبت را ثبت کنید
              </p>
              <button
                onClick={() => router.push("/clientdashboard/bookingsubmit")}
                className="bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl px-6 py-3 font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" /> ثبت اولین نوبت
              </button>
            </div>
          ) : (
            calendarDays.map((day, index) => (
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
            ))
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
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        services={dynamicServices.slice(1)}
      />
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
