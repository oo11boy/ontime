"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Loader2, CalendarClock } from "lucide-react";
import { DashboardBookingCard } from "./DashboardBookingCard";
import { useRecentBookings } from "@/hooks/useBookings"; // استفاده مستقیم از هوک

export const DashboardRecentAppointments: React.FC = () => {
  // استفاده از توانایی React Query برای مدیریت لودینگ
  const { data, isLoading, error } = useRecentBookings();
  const appointments = data?.appointments || [];

  if (isLoading) {
    return (
      <div className="w-[95%] mx-auto mt-4 bg-[#1B1F28] rounded-xl p-8 flex flex-col items-center border border-emerald-500/10">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-gray-400 mt-2 text-sm">در حال هماهنگی نوبت‌ها...</p>
      </div>
    );
  }

  if (error) return null; // در صورت خطا چیزی نشان نده یا یک پیام کوچک

  return (
    <div className="w-[95%]! m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
      <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-start items-center shadow-sm w-full mx-auto border border-emerald-500/20">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-white font-bold text-lg flex items-center gap-3">
            <CalendarClock className="w-5 h-5 text-emerald-400" />
            نزدیک‌ترین نوبت‌ها
            {appointments.length > 0 && (
              <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                {appointments.length} مورد
              </span>
            )}
          </span>

          {appointments.length > 1 && (
            <div className="flex gap-2">
              <button className="custom-prev bg-gray-800 hover:bg-emerald-500/20 text-white w-8 h-8 rounded-lg transition-all flex items-center justify-center border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
              <button className="custom-next bg-gray-800 hover:bg-emerald-500/20 text-white w-8 h-8 rounded-lg transition-all flex items-center justify-center border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
              </button>
            </div>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="w-full py-6 text-center border-2 border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500 text-sm">نوبت فعالی برای نمایش وجود ندارد</p>
          </div>
        ) : (
          <div className="w-full">
            <Swiper
              modules={[Navigation, Autoplay, A11y]}
              autoplay={{ delay: 5000 }}
              navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
              slidesPerView={1}
              spaceBetween={15}
              className="mySwiper"
            >
              {appointments.map((appointment) => (
                <SwiperSlide key={appointment.id}>
                  <DashboardBookingCard appointment={appointment} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </div>
  );
};