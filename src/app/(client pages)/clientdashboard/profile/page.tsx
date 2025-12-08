"use client";
import React, { useState } from "react";
import {
  MessageCircle,
  X,
  CheckCircle,
  Calendar,
  Ban,
  AlertCircle,
  Trash2,
  Send,
  Phone,
  User,
} from "lucide-react";
import Footer from "../components/Footer/Footer";

const customerData = {
  id: "123",
  name: "رضا احمدی",
  phone: "0935 450 2369",
  category: "اصلاح مو و ریش",
  isBlocked: false,
  totalAppointments: 15,
  canceledAppointments: 3,
  appointments: [
    { id: 1, date: "چهارشنبه، ۳۰ آبان", time: "۱۱:۰۰ صبح", note: "اصلاح ریش و اصلاح مو", status: "pending" },
    { id: 2, date: "پنجشنبه، ۱ آذر", time: "۱۴:۰۰ بعدازظهر", note: "اصلاح مو", status: "pending" },
    { id: 3, date: "دوشنبه، ۲۸ آبان", time: "۱۶:۳۰ عصر", note: "خط ریش", status: "canceled" },
  ],
};

export default function CustomerProfile() {
  const [customer, setCustomer] = useState(customerData);
  const [showGeneralSmsModal, setShowGeneralSmsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);

  const [sendCancellationSms, setSendCancellationSms] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");
  const [generalSmsMessage, setGeneralSmsMessage] = useState("");

  const handleCancelAppointment = (apptId: number) => {
    if (sendCancellationSms && cancellationMessage.trim()) {
      console.log(`پیامک کنسلی ارسال شد: ${cancellationMessage}`);
    }

    setCustomer({
      ...customer,
      appointments: customer.appointments.map((appt) =>
        appt.id === apptId ? { ...appt, status: "canceled" } : appt
      ),
      canceledAppointments: customer.canceledAppointments + 1,
    });

    setShowCancelModal(null);
    setSendCancellationSms(false);
    setCancellationMessage("");
  };

  const handleSendGeneralSms = () => {
    if (generalSmsMessage.trim()) {
      console.log(`پیامک عمومی ارسال شد: ${generalSmsMessage}`);
      setShowGeneralSmsModal(false);
      setGeneralSmsMessage("");
    }
  };

  const handleBlockCustomer = () => {
    setCustomer({ ...customer, isBlocked: true });
    setShowBlockModal(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* کارت اصلی پروفایل */}
        <div className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border ${customer.isBlocked ? "border-red-500/50" : "border-emerald-500/20"} overflow-hidden shadow-2xl`}>
          
          {/* نوار بلاک شده */}
          {customer.isBlocked && (
            <div className="bg-linear-to-r from-red-600 to-red-700 text-white text-center py-3.5 font-bold text-sm shadow-lg">
              این مشتری بلاک شده است
            </div>
          )}

          <div className="p-6">

            {/* هدر پروفایل */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl ${customer.isBlocked ? "bg-red-500/20 text-red-400" : "bg-linear-to-br from-emerald-500 to-emerald-600"}`}>
                  {customer.name[0]}
                </div>
                <div className="text-right">
                  <h1 className="text-xl font-bold">{customer.name}</h1>
                  <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    {customer.phone}
                  </p>
                  <p className="text-emerald-400 text-sm font-medium mt-2">
                    {customer.category}
                  </p>
                </div>
              </div>
            </div>

            {/* دکمه‌های عملیاتی */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setShowGeneralSmsModal(true)}
                disabled={customer.isBlocked}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  customer.isBlocked
                    ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                    : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                ارسال پیامک
              </button>

              {!customer.isBlocked && (
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="flex-1 py-3.5 bg-linear-to-r from-red-500 to-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 active:scale-95 shadow-lg"
                >
                  <Ban className="w-5 h-5" />
                  بلاک کردن
                </button>
              )}
            </div>

            {/* آمار */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">کل نوبت‌ها</p>
                <p className="text-2xl font-bold mt-1">{customer.totalAppointments}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-red-500/20 text-center">
                <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">کنسلی‌ها</p>
                <p className="text-2xl font-bold mt-1 text-red-400">{customer.canceledAppointments}</p>
              </div>
            </div>

            {/* لیست نوبت‌ها */}
            <div>
              <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-400" />
                نوبت‌های ثبت شده
              </h3>

              <div className="space-y-4">
                {customer.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className={`bg-white/5 backdrop-blur-sm rounded-xl p-5 border transition-all ${
                      appt.status === "canceled"
                        ? "border-red-500/40 opacity-70"
                        : "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 text-right">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-bold text-white">{appt.date}</span>
                          <span className="text-sm text-gray-300">{appt.time}</span>
                          {appt.status === "canceled" && (
                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-xs font-bold">
                              کنسل شده
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{appt.note}</p>
                      </div>

                      {appt.status !== "canceled" && !customer.isBlocked && (
                        <button
                          onClick={() => setShowCancelModal(appt.id)}
                          className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال‌های هماهنگ با دیزاین اصلی */}

      {/* مودال ارسال پیامک عمومی */}
      {showGeneralSmsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowGeneralSmsModal(false)}>
          <div className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-emerald-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-emerald-400" />
                ارسال پیامک به {customer.name}
              </h3>
              <button onClick={() => setShowGeneralSmsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <textarea
              value={generalSmsMessage}
              onChange={(e) => setGeneralSmsMessage(e.target.value)}
              placeholder="متن پیامک را اینجا بنویسید..."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-40 resize-none"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSendGeneralSms}
                disabled={!generalSmsMessage.trim()}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
                  generalSmsMessage.trim()
                    ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                } flex items-center justify-center gap-2`}
              >
                <Send className="w-5 h-5" />
                ارسال پیامک
              </button>
              <button
                onClick={() => setShowGeneralSmsModal(false)}
                className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال کنسل نوبت */}
      {showCancelModal !== null && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
          <div className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-400 mb-5">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-xl font-bold">کنسل کردن نوبت</h3>
            </div>
            <p className="text-gray-300 mb-6">آیا از کنسل کردن این نوبت مطمئن هستید؟</p>

            <label className="flex items-center gap-3 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendCancellationSms}
                onChange={(e) => setSendCancellationSms(e.target.checked)}
                className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
              />
              <span className="text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                ارسال پیامک اطلاع‌رسانی کنسلی
              </span>
            </label>

            {sendCancellationSms && (
              <textarea
                value={cancellationMessage}
                onChange={(e) => setCancellationMessage(e.target.value)}
                placeholder="متن پیامک کنسلی..."
                className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-32 resize-none mb-4"
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleCancelAppointment(showCancelModal)}
                disabled={sendCancellationSms && !cancellationMessage.trim()}
                className="flex-1 py-3.5 bg-linear-to-r from-red-500 to-red-600 rounded-xl font-bold hover:from-red-600 hover:to-red-700 active:scale-95"
              >
                کنسل کن
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(null);
                  setSendCancellationSms(false);
                  setCancellationMessage("");
                }}
                className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال بلاک کردن */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowBlockModal(false)}>
          <div className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-red-400 mb-5">
              <Ban className="w-8 h-8" />
              <h3 className="text-xl font-bold">بلاک کردن مشتری</h3>
            </div>
            <p className="text-gray-300 mb-6">
              آیا از بلاک کردن <strong>{customer.name}</strong> مطمئن هستید؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleBlockCustomer}
                className="flex-1 py-3.5 bg-linear-to-r from-red-500 to-red-600 rounded-xl font-bold hover:from-red-600 hover:to-red-700"
              >
                بله، بلاک کن
              </button>
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}