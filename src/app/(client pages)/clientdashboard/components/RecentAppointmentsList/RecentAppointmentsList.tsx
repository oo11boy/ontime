"use client";
import React from "react";
import BookingCard from "./bookingcard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function RecentAppointmentsList() {
  const appointments = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-[95%]! m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
      <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-start items-center shadow-sm w-full mx-auto border border-emerald-500/20">
        
        <div className="flex justify-between items-center w-full mb-4">
            
          <span className="text-white font-bold text-lg flex items-center gap-3">
            نزدیک‌ترین نوبت‌ها:
          </span>

          <div className="flex space-x-2 space-x-reverse">
            {/* دکمه قبلی - حالا با تم سبز هماهنگ */}
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
        </div>

        <div className="w-full">
          <Swiper
            modules={[Navigation, Autoplay, A11y]}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            navigation={{
              prevEl: ".custom-prev",
              nextEl: ".custom-next",
            }}
            slidesPerView={1}
            spaceBetween={15}
            grabCursor={true}
            className="mySwiper pt-2"
          >
            {appointments.map((appointmentId) => (
              <SwiperSlide key={appointmentId} className="h-full">
                <BookingCard />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
      </div>
    </div>
  );
}