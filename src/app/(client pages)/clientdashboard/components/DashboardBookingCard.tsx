// src/app/(client pages)/clientdashboard/components/DashboardBookingCard.tsx
import Link from "next/link";
import React from "react";
import { formatPersianDateTime } from "@/lib/date-utils";

interface DashboardBookingCardProps {
  appointment: {
    id: number;
    client_name: string;
    client_phone: string;
    booking_date: string;
    booking_time: string;
    booking_description: string;
    services?: string;
    status: string;
  };
}

export const DashboardBookingCard: React.FC<DashboardBookingCardProps> = ({ appointment }) => {
  const formattedDateTime = appointment.booking_date && appointment.booking_time 
    ? formatPersianDateTime(appointment.booking_date, appointment.booking_time)
    : "تاریخ نامشخص";
  
  const timeOnly = appointment.booking_time 
    ? appointment.booking_time.split(":").slice(0, 2).join(":") 
    : "ساعت نامشخص";

  const getInitial = (name: string) => {
    return name ? name.charAt(0) : "ن";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 mb-5 w-full mx-auto border-r-4 border-emerald-500 hover:shadow-xl transition-shadow duration-300">
      
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-dashed border-gray-200">
        <div className="flex items-center">
          <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex justify-center items-center text-lg font-bold ml-3">
            {getInitial(appointment.client_name)}
          </div>
          
          <div className="text-right">
            <div className="text-base font-semibold text-gray-800">
              {appointment.client_name || "نامشخص"}
            </div>
            <div className="text-sm text-gray-500">
              {appointment.client_phone || "شماره نامشخص"}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 pb-2 text-right">
        <div className="flex items-center text-text-xs text-gray-600 mb-2 flex-wrap">
          <span className="ml-2 text-yellow-500 text-xs">تقویم</span>
          <span className="text-xs">
            {formattedDateTime}
          </span>
          
          <span className="mr-4 ml-2 text-yellow-500 text-base">ساعت</span>
          <span className="text-xs">ساعت {timeOnly}</span>
        </div>
        
        {appointment.services && (
          <div className="text-sm text-gray-600 mt-2">
            <span className="font-medium">خدمات:</span> {appointment.services}
          </div>
        )}
        
        {appointment.booking_description && (
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">یادداشت:</span> {appointment.booking_description}
          </div>
        )}
      </div>

      <div className="flex justify-end items-center pt-3 border-t border-dashed border-gray-200 gap-3">
        <Link 
          href={`/clientdashboard/customers/profile/${appointment.client_phone}`}
          className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-colors"
        >
          مشاهده پروفایل
        </Link>
      </div>
    </div>
  );
};