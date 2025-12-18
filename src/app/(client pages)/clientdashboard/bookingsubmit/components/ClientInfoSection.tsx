import React from "react";
import { User, Phone, Contact } from "lucide-react";
import { formatPersianDate } from "@/lib/date-utils";
import { ExistingClient } from "../types";

interface ClientInfoSectionProps {
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  isCheckingClient: boolean;
  existingClient: ExistingClient | null;
}

const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
  name,
  setName,
  phone,
  setPhone,
  isCheckingClient,
  existingClient,
}) => {
  return (
    <div className="flex items-end gap-4">
      <div className="flex-1 space-y-4">
        <div>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              className="w-full bg-white/10 border border-white/10 rounded-xl pr-12 px-4 py-3.5 text-right placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm"
            />
            <User className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="شماره موبایل (مثال: 09123456789)"
              dir="ltr"
              className="w-full bg-white/10 border border-white/10 rounded-xl text-right px-4 py-3.5 pr-12 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 transition backdrop-blur-sm font-mono"
            />
            <Phone className="absolute right-4 top-4 w-5 h-5 text-emerald-400" />
            {isCheckingClient && (
              <div className="absolute left-4 top-4">
                <div className="w-5 h-5 border-2 border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* نمایش اطلاعات مشتری موجود */}
          {existingClient && !isCheckingClient && (
            <div className="mt-2">
              <div className={`p-3 rounded-xl border ${existingClient.isBlocked ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">
                      مشتری موجود: {existingClient.name}
                    </span>
                  </div>
                  {existingClient.isBlocked ? (
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
                      بلاک شده
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-full">
                      {existingClient.totalBookings || 0} نوبت قبلی
                    </span>
                  )}
                </div>
                {existingClient.lastBookingDate && !existingClient.isBlocked && (
                  <p className="text-xs text-gray-400 mt-1">
                    آخرین نوبت: {formatPersianDate(existingClient.lastBookingDate)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <button className="w-[120px] h-[120px] bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center gap-3 hover:bg-white/15 transition-all hover:border-emerald-400">
        <Contact className="w-10 h-10 text-emerald-400" />
        <span className="text-xs text-center leading-tight">
          انتخاب از <br /> مخاطبین
        </span>
      </button>
    </div>
  );
};

export default ClientInfoSection;