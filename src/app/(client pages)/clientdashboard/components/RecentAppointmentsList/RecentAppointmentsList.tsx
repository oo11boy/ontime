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
        
        {/* کانتینر برای عنوان و دکمه‌ها */}
        <div className="flex justify-between items-center w-full mb-4">
            
            {/* عنوان در سمت راست (RTL) */}
            <span className="text-white font-bold text-lg"> 
              ⏰ نزدیک‌ترین نوبت‌ها:
            </span>

            {/* کانتینر دکمه‌های ناوبری در سمت چپ (بالا سمت راست شما) */}
            <div className="flex space-x-2 space-x-reverse"> 
                {/* 3. دکمه قبل (Prev) - از Tailwind برای استایل استفاده شده است */}
                <button className="custom-prev bg-[#2d3139] hover:bg-[#3f4552] text-white p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center">
                    {/* آیکون فلش راست (Prev در RTL) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
                
                {/* 4. دکمه بعد (Next) - از Tailwind برای استایل استفاده شده است */}
                <button className="custom-next bg-[#2d3139] hover:bg-[#3f4552] text-white p-2 rounded-full transition-colors w-8 h-8 flex items-center justify-center">
                    {/* آیکون فلش چپ (Next در RTL) */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>
        </div>

        {/* 5. استفاده از کامپوننت Swiper */}
        <div className="w-full">
          <Swiper
            // 6. ماژول‌های مورد استفاده: Navigation و Autoplay
            modules={[Navigation, Autoplay, A11y]}
            
            // 7. تنظیمات اسلاید خودکار (Autoplay)
            autoplay={{
                delay: 4000, // هر 4 ثانیه اسلاید عوض شود
                disableOnInteraction: false, // حتی بعد از تعامل کاربر، اسلاید خودکار ادامه یابد
            }}
            
            // 8. تنظیمات ناوبری (Navigation) برای دکمه‌های سفارشی
            navigation={{
                prevEl: '.custom-prev', // دکمه قبلی
                nextEl: '.custom-next', // دکمه بعدی
            }}

            // 9. تنظیمات نمایش کارت‌ها
            slidesPerView={1}
            spaceBetween={15}
            grabCursor={true}
            // Pagination را حذف کردیم
            
            // تنظیمات واکنش‌گرا (Responsive)
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
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