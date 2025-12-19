import React, { useState } from "react";
import { User, Phone, Contact, Search, X } from "lucide-react";
import { formatPersianDate } from "@/lib/date-utils";
import { ExistingClient } from "../types";
import { useCustomers } from "@/hooks/useCustomers"; // هوک لیست مشتریان

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
  const [isClientListOpen, setIsClientListOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");

  // دریافت لیست مشتریان (صفحه ۱، جستجو)
  const { data: customersData, isLoading } = useCustomers(1, clientSearch);

  const clients = customersData?.clients || [];

  // اعتبارسنجی و فرمت شماره موبایل
  const handlePhoneChange = (value: string) => {
    // فقط اعداد رو نگه دار
    const digits = value.replace(/\D/g, "");

    // اگر با 09 شروع نشده و کاربر داره تایپ می‌کنه، خودکار 09 اضافه کن
    let formatted = digits;
    if (digits.startsWith("9") && digits.length >= 1) {
      formatted = "0" + digits;
    } else if (!digits.startsWith("09") && digits.length > 0) {
      formatted = "09" + digits.slice(1); // اصلاح اگر کاربر 9 تایپ کرد
    }

    // حداکثر ۱۱ رقم
    if (formatted.length <= 11) {
      setPhone(formatted);
    }
  };

  // انتخاب مشتری از لیست
  const handleSelectClient = (client: any) => {
    setName(client.name);
    setPhone(client.phone);
    setIsClientListOpen(false);
    setClientSearch("");
  };

  return (
    <>
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-4">
          {/* نام مشتری */}
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

          {/* شماره موبایل */}
          <div>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={phone}
                onChange={(e) => {
                  // فقط اعداد رو نگه دار
                  const digits = e.target.value.replace(/\D/g, "");

                  // حداکثر 11 رقم (بدون 0 اولیه در نمایش)
                  if (digits.length <= 11) {
                    // اگر کاربر 11 رقم وارد کرد و با 9 شروع شد، قبول کن
                    // اگر با 09 شروع شد، 0 اولیه رو حذف کن در نمایش
                    let displayValue = digits;
                    if (digits.startsWith("09") && digits.length === 11) {
                      displayValue = digits.slice(1); // نمایش بده: 9123456789
                    } else if (digits.startsWith("9") && digits.length <= 10) {
                      displayValue = digits; // عادی
                    } else if (
                      digits.length === 11 &&
                      !digits.startsWith("09")
                    ) {
                      // اگر 11 رقم بدون 09 وارد کرد، قبول نکن (جلوگیری از اشتباه)
                      return;
                    }

                    setPhone(displayValue);
                  }
                }}
                placeholder="9123456789"
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
          </div>
        </div>

        {/* دکمه انتخاب از لیست مشتریان */}
        <button
          onClick={() => setIsClientListOpen(true)}
          className="w-[120px] h-[120px] bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center gap-3 hover:bg-white/15 transition-all hover:border-emerald-400"
        >
          <Contact className="w-10 h-10 text-emerald-400" />
          <span className="text-xs text-center leading-tight">
            انتخاب از <br /> مشتریان
          </span>
        </button>
      </div>

      {/* مودال لیست مشتریان */}
      {isClientListOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-[#1a1e26] w-full rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* هدر مودال */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsClientListOpen(false);
                  setClientSearch("");
                }}
                className="p-2"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
              <h3 className="text-lg font-bold">انتخاب مشتری</h3>
              <div className="w-10" />
            </div>

            {/* جستجو */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام یا شماره..."
                  className="w-full bg-white/10 rounded-xl pr-12 px-4 py-3 text-right placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 border border-white/10"
                />
              </div>
            </div>

            {/* لیست مشتریان */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {isLoading ? (
                <div className="text-center py-8 text-gray-400">
                  در حال بارگذاری...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  مشتری یافت نشد
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map((client: any) => (
                    <button
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                      className="w-full p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-right border border-white/10"
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        {client.phone.replace(
                          /(\d{4})(\d{3})(\d{4})/,
                          "$1 $2 $3"
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {client.total_bookings || 0} نوبت ثبت شده
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientInfoSection;
