"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import { CalendarClock, ArrowLeft, ArrowRight, LayoutList } from "lucide-react";
import { DashboardBookingCard } from "./DashboardBookingCard";
import { useRecentBookings } from "@/hooks/useBookings";
import { motion } from "framer-motion";

export const DashboardRecentAppointments: React.FC = () => {
  const { data, isLoading, error } = useRecentBookings();
  const appointments = data?.appointments || [];

  if (isLoading) {
    return (
      <div className="w-full px-4 mt-6">
        <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-[2rem] p-8 flex flex-col items-center border border-white/5 animate-pulse">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl mb-4" />
          <div className="w-32 h-4 bg-slate-800 rounded-full mb-2" />
          <div className="w-20 h-3 bg-slate-800/50 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-6 px-2 sm:px-4"
    >
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-5 sm:p-7 border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="flex justify-between items-center w-full mb-6 px-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <CalendarClock className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-white font-black text-base sm:text-lg">نوبت‌های پیش‌رو</h2>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mr-10">مدیریت و مشاهده آخرین رزروها</p>
          </div>

          {appointments.length > 1 && (
            <div className="hidden sm:flex gap-2">
              <button className="custom-prev-btn bg-white/5 hover:bg-white/10 text-white w-10 h-10 rounded-2xl transition-all flex items-center justify-center border border-white/5 active:scale-90">
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="custom-next-btn bg-white/5 hover:bg-white/10 text-white w-10 h-10 rounded-2xl transition-all flex items-center justify-center border border-white/5 active:scale-90">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Section */}
        {appointments.length === 0 ? (
          <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
            <LayoutList className="w-10 h-10 text-slate-700 mb-3" />
            <p className="text-slate-500 text-sm font-bold">هنوز هیچ نوبتی ثبت نشده است</p>
            <p className="text-slate-600 text-xs mt-1">اولین نوبت خود را همین حالا ثبت کنید</p>
          </div>
        ) : (
          <div className="w-full relative">
            <Swiper
              modules={[Navigation, Autoplay, Pagination, EffectCoverflow]}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              navigation={{ prevEl: ".custom-prev-btn", nextEl: ".custom-next-btn" }}
              pagination={{ clickable: true, dynamicBullets: true }}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={"auto"}
              initialSlide={0}
              spaceBetween={15}
              className="pb-10 !overflow-visible"
            >
              {appointments.map((appointment) => (
                <SwiperSlide key={appointment.id} className="!w-[280px] sm:!w-[340px]">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="h-full transition-transform duration-300"
                  >
                    <DashboardBookingCard appointment={appointment} />
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Gradient Overlays for smooth edges */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-[#1D222A] to-transparent z-10 pointer-events-none hidden sm:block" />
            <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-[#1D222A] to-transparent z-10 pointer-events-none hidden sm:block" />
          </div>
        )}
      </div>
    </motion.div>
  );
};