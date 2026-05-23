"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  X,
  ShoppingBag,
  Clock,
  CheckCircle,
  ChevronLeft,
  Timer,
  FileText,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { DateTimeSelector } from "./DateTimeSelector";
import { BusinessData } from "../../../shared/types";

const formatPrice = (price: number | string): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "0";
  return numPrice.toLocaleString("fa-IR");
};

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: BusinessData;
  slug: string;
  customerPhone: string;
  customerName: string;
  onSuccess: () => void;
}

export function NewBookingModal({
  isOpen,
  onClose,
  business,
  slug,
  customerPhone,
  customerName,
  onSuccess,
}: NewBookingModalProps) {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [showServiceSelector, setShowServiceSelector] = useState(true);

  const selectedServicesData = business.services.filter((s) =>
    selectedServices.includes(s.id),
  );
  const totalDuration = selectedServicesData.reduce(
    (sum, s) => sum + (Number(s.duration_minutes) || 0),
    0,
  );
  const totalPrice = selectedServicesData.reduce(
    (sum, s) => sum + (Number(s.price) || 0),
    0,
  );

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast.error("حداقل یک خدمت انتخاب کنید");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error("تاریخ و ساعت نوبت را انتخاب کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer/new-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_ids: selectedServices,
          booking_date: selectedDate,
          booking_time: selectedTime,
          description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("درخواست نوبت شما ثبت شد و در انتظار تأیید است");
        onSuccess();
        onClose();
        setSelectedServices([]);
        setSelectedDate("");
        setSelectedTime("");
        setDescription("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("خطا در ثبت درخواست");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-800/95 backdrop-blur-2xl rounded-3xl w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-gray-800/95 backdrop-blur-2xl p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">ثبت نوبت جدید</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between px-2">
            {[
              {
                id: 1,
                label: "خدمات",
                icon: ShoppingBag,
                active: showServiceSelector,
              },
              {
                id: 2,
                label: "تاریخ و ساعت",
                icon: Clock,
                active:
                  !showServiceSelector && (!selectedDate || !selectedTime),
              },
              {
                id: 3,
                label: "ثبت نهایی",
                icon: CheckCircle,
                active:
                  selectedDate && selectedTime && selectedServices.length > 0,
              },
            ].map((step) => (
              <div key={step.id} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center transition-all ${
                    step.active
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-white/10 text-gray-500"
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <p
                  className={`text-[10px] mt-1 ${
                    step.active ? "text-emerald-400" : "text-gray-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>

          {showServiceSelector ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> انتخاب
                  خدمات
                </label>
                {selectedServices.length > 0 && (
                  <button
                    onClick={() => setShowServiceSelector(false)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                  >
                    ادامه <ChevronLeft className="w-3 h-3 inline" />
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {business.services.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedServices.includes(service.id)
                        ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 shadow-lg"
                        : "bg-white/5 border-white/10 hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedServices([
                              ...selectedServices,
                              service.id,
                            ]);
                          else
                            setSelectedServices(
                              selectedServices.filter(
                                (id) => id !== service.id,
                              ),
                            );
                        }}
                        className="w-4 h-4 rounded border-white/20 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Timer className="w-3 h-3" />{" "}
                          {service.duration_minutes} دقیقه
                        </p>
                      </div>
                    </div>
                    <span className="text-emerald-400 text-sm font-bold">
                      {formatPrice(service.price)} تومان
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {selectedServices.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-3 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <p className="text-sm text-gray-300">خدمات انتخاب شده:</p>
                  </div>
                  {selectedServicesData.map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-gray-400">{service.name}</span>
                      <span className="text-emerald-400">
                        {formatPrice(service.price)} تومان
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                    <span className="text-gray-300 text-sm font-bold">
                      مجموع:
                    </span>
                    <span className="text-emerald-400 text-lg font-bold">
                      {formatPrice(totalPrice)} تومان
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Timer className="w-3 h-3" /> مدت زمان تقریبی:{" "}
                    {totalDuration} دقیقه
                  </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />پرداحت در محل 
                  </p>
                </div>
              )}

              <DateTimeSelector
                slug={slug}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setDateError(null);
                }}
                onTimeChange={(time) => setSelectedTime(time)}
                onError={(error) => setDateError(error)}
              />

              {dateError && (
                <div className="text-red-400 text-sm text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {dateError}
                </div>
              )}

              <div>
                <label className=" text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> توضیحات (اختیاری)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات اضافی خود را بنویسید..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowServiceSelector(true)}
                  className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl font-medium hover:bg-white/10 transition"
                >
                  بازگشت
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedDate || !selectedTime}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}{" "}
                  ثبت درخواست
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
