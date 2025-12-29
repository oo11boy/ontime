"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { Calendar } from "lucide-react";
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

interface Service {
  id: number;
  name: string;
  is_active: boolean;
}

export default function CalendarPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading, refetch: refetchAppointments } = useBookings();
  const { data: servicesData } = useServices();
  const { balance: userSmsBalance, isLoading: isLoadingBalance } = useSmsBalance();
  const { mutateAsync: sendBulkSms } = useSendBulkSms();

  const { data: userData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/client/settings");
      return res.json();
    },
  });

  const allAppointments = useMemo(() => (bookingsData?.bookings as Appointment[]) || [], [bookingsData]);
  const services: Service[] = useMemo(() => (servicesData?.services as Service[]) || [], [servicesData]);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showBulkSmsModal, setShowBulkSmsModal] = useState(false);
  const [selectedDayForSms, setSelectedDayForSms] = useState<Date | null>(null);
  const [selectedService, setSelectedService] = useState<string>("all");

  const todayJalali = useMemo(() => getTodayJalali(), []);

  const handleUpdateBusinessName = async (newName: string) => {
    try {
      const response = await fetch("/api/client/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData?.user, business_name: newName }),
      });
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const filteredAppointments = useMemo(() => {
    if (selectedService === "all") return allAppointments;
    return allAppointments.filter((app) => {
      // اصلاح بخش خطا دار با تعیین صریح نوع داده (Type Casting)
      const serviceList: string[] = typeof app.services === 'string' 
        ? (app.services as string).split(',').map((s: string) => s.trim()) 
        : Array.isArray(app.services) 
          ? (app.services as any[]).map((s: any) => String(s).trim()) 
          : [];
      
      return serviceList.some((s: string) => s === selectedService.trim());
    });
  }, [allAppointments, selectedService]);

  useEffect(() => {
    const generateCalendar = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const uniqueDates = new Set<string>();
      filteredAppointments.forEach((app) => uniqueDates.add(app.booking_date));

      const days: CalendarDay[] = Array.from(uniqueDates)
        .map(d => new Date(d))
        .sort((a, b) => a.getTime() - b.getTime())
        .map(date => {
          date.setHours(0, 0, 0, 0);
          const persian = gregorianToPersian(date);
          const dayApps = filteredAppointments.filter(app => new Date(app.booking_date).toDateString() === date.toDateString());
          return {
            date,
            jalaliDate: { ...persian },
            isToday: date.toDateString() === today.toDateString(),
            isPast: date < today && date.toDateString() !== today.toDateString(),
            isWeekend: persian.weekDay === 'جمعه',
            appointments: dayApps,
            hasAppointments: dayApps.length > 0,
          };
        });
      setCalendarDays(days);
    };
    generateCalendar();
  }, [filteredAppointments]);

  const handleSendBulkSms = async (templateKey: string, appointmentIds: (string | number)[]) => {
    const recipients = appointmentIds.map(id => {
      const app = allAppointments.find(a => a.id === id);
      return { phone: app?.client_phone || "", name: app?.client_name || "" };
    }).filter(r => r.phone);

    await sendBulkSms({ recipients, templateKey, sms_type: "bulk_appointments" });
    refetchAppointments();
  };

  const appointmentsForSms = useMemo(() => {
    if (!selectedDayForSms) return [];
    const day = calendarDays.find(d => d.date.toDateString() === selectedDayForSms.toDateString());
    return (day?.appointments || [])
      .filter(app => app.status === "active")
      .map(app => ({
        id: app.id,
        name: app.client_name,
        details: `${app.booking_time} - ${app.services}`
      }));
  }, [selectedDayForSms, calendarDays]);

  return (
    <div className="min-h-screen text-white max-w-md mx-auto relative">
      <Toaster position="top-center" />
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] pb-32">
        <HeaderSection
          userSmsBalance={userSmsBalance}
          isLoadingBalance={isLoadingBalance}
          isLoading={isLoading}
          selectedService={selectedService}
          filteredAppointments={filteredAppointments}
          onRefresh={() => refetchAppointments()}
          onFilterClick={() => setShowFilterModal(true)}
          onAddAppointment={() => router.push(`/clientdashboard/bookingsubmit?date=${encodeURIComponent(`${todayJalali.year}/${todayJalali.month+1}/${todayJalali.day}`)}`)}
          onClearFilter={() => setSelectedService("all")}
        />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {isLoading ? (
            <div className="text-center py-10 opacity-50">در حال بارگذاری...</div>
          ) : calendarDays.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-400">نوبتی یافت نشد</h3>
            </div>
          ) : (
            calendarDays.map((day, idx) => (
              <CalendarDayCard
                key={idx}
                day={day}
                getDayName={(d) => gregorianToPersian(d).weekDay}
                onAddAppointment={() => router.push(`/clientdashboard/bookingsubmit?date=${encodeURIComponent(`${day.jalaliDate.year}/${day.jalaliDate.month+1}/${day.jalaliDate.day}`)}`)}
                onBulkSmsClick={() => { setSelectedDayForSms(day.date); setShowBulkSmsModal(true); }}
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
          onCancel={() => refetchAppointments()}
        />
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        services={services.filter(s => s.is_active).map(s => s.name)}
      />

      <BulkSmsModal
        isOpen={showBulkSmsModal}
        onClose={() => { setShowBulkSmsModal(false); setSelectedDayForSms(null); }}
        title={`اطلاع‌رسانی نوبت‌های ${selectedDayForSms ? gregorianToPersian(selectedDayForSms).day + " " + gregorianToPersian(selectedDayForSms).monthName : ""}`}
        recipients={appointmentsForSms}
        userSmsBalance={userSmsBalance}
        businessName={userData?.user?.business_name || null}
        onSend={handleSendBulkSms}
        onUpdateBusinessName={handleUpdateBusinessName}
      />
    </div>
  );
}