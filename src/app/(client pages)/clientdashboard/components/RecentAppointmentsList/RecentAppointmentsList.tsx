// File Path: src\app\(client pages)\clientdashboard\components\RecentAppointmentsList\RecentAppointmentsList.tsx

// src/components/RecentAppointmentsList.tsx
"use client";
import React, { useState, useEffect } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Loader2 } from "lucide-react";
import BookingCard from "./bookingcard";

export default function RecentAppointmentsList() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentAppointments();
  }, []);

  const fetchRecentAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings/recent");
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments);
      } else {
        setError(data.message || "خطا در دریافت نوبت‌ها");
      }
    } catch (error) {
      console.error("Error fetching recent appointments:", error);
      setError("خطا در اتصال به سرور");
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="w-[95%] m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
        <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-center items-center shadow-sm w-full mx-auto border border-emerald-500/20">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-gray-300 mt-2">در حال دریافت نوبت‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[95%] m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
        <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-center items-center shadow-sm w-full mx-auto border border-emerald-500/20">
          <p className="text-red-400 text-center">{error}</p>
          <button 
            onClick={fetchRecentAppointments}
            className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[95%]! m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
      <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-start items-center shadow-sm w-full mx-auto border border-emerald-500/20">
        
        <div className="flex justify-between items-center w-full mb-4">
          <span className="text-white font-bold text-lg flex items-center gap-3">
            نزدیک‌ترین نوبت‌ها:
            {appointments.length > 0 && (
              <span className="text-emerald-400 text-sm bg-emerald-500/20 px-2 py-1 rounded-full">
                {appointments.length} نوبت
              </span>
            )}
          </span>

          {appointments.length > 1 && (
            <div className="flex space-x-2 space-x-reverse">
              {/* دکمه قبلی */}
              <button className="custom-prev bg-emerald-500/20 hover:bg-emerald-500/40 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 w-8 h-8 flex items-center justify-center border border-emerald-400/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              
              {/* دکمه بعدی */}
              <button className="custom-next bg-emerald-500/20 hover:bg-emerald-500/40 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 w-8 h-8 flex items-center justify-center border border-emerald-400/30">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="w-full py-8 text-center">
            <p className="text-gray-400">هیچ نوبت فعالی در آینده نزدیک وجود ندارد</p>
          </div>
        ) : (
          <div className="w-full">
            <Swiper
              modules={[Navigation, Autoplay, A11y]}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              navigation={appointments.length > 1 ? {
                prevEl: ".custom-prev",
                nextEl: ".custom-next",
              } : false}
              slidesPerView={1}
              spaceBetween={15}
              grabCursor={true}
              className="mySwiper pt-2"
            >
              {appointments.map((appointment) => (
                <SwiperSlide key={appointment.id} className="h-full">
                  <BookingCard
                    appointment={appointment} 
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        
      </div>
    </div>
  );
}