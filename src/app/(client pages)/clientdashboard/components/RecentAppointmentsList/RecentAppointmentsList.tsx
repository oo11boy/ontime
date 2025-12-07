"use client"
import React from "react";
import BookingCard from "./bookingcard";
// 1. ماژول‌های مورد نیاز (Navigation و Autoplay) را وارد کنید
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, A11y } from 'swiper/modules';

// 2. استایل‌های Swiper و Navigation را وارد کنید
import 'swiper/css';
import 'swiper/css/navigation'; 
// import 'swiper/css/scrollbar'; // اگر Scrollbar نیاز نیست، حذف شود

export default function RecentAppointmentsList() {
  const appointments = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-[95%]! m-auto h-auto mt-4 ServiceControlPanel shadow-2xl flex justify-start items-center flex-col">
      <div className="bg-[#1B1F28] h-full rounded-xl p-4 flex flex-col justify-start items-center shadow-sm w-full mx-auto">
        
        <div className="flex justify-between items-center w-full mb-4">
            
            <span className="text-white font-bold text-lg"> 
              ⏰ نزدیک‌ترین نوبت‌ها:
            </span>

            <div className="flex space-x-2 space-x-reverse"> 
               <button className="custom-prev bg-[#2d3139] hover:bg-[#3f4552] text-white p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
                
                <button className="custom-next bg-[#2d3139] hover:bg-[#3f4552] text-white p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center">
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
                prevEl: '.custom-prev', // دکمه قبلی
                nextEl: '.custom-next', // دکمه بعدی
            }}

            slidesPerView={1}
            spaceBetween={15}
            grabCursor={true}
       
            className="mySwiper pt-2"
          >
            {/* تکرار BookingCard داخل SwiperSlide */}
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