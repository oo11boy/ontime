"use client";
import React, { useState } from "react";
import { MessageCircle, X, CheckCircle, Calendar, Ban, AlertCircle, Trash2, Send } from "lucide-react";
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
  
  // حالت‌های مودال‌ها
  const [showGeneralSmsModal, setShowGeneralSmsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);
  
  // برای مودال کنسلی
  const [sendCancellationSms, setSendCancellationSms] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");
  
  // برای مودال پیامک عمومی
  const [generalSmsMessage, setGeneralSmsMessage] = useState("");

  // توابع
  const handleCancelAppointment = (apptId: number) => {
    if (sendCancellationSms && cancellationMessage.trim()) {
      console.log(`پیامک کنسلی ارسال شد به ${customer.phone}: ${cancellationMessage}`);
    }

    setCustomer({
      ...customer,
      appointments: customer.appointments.map(appt =>
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
      console.log(`پیامک عمومی ارسال شد به ${customer.phone}: ${generalSmsMessage}`);
      setShowGeneralSmsModal(false);
      setGeneralSmsMessage("");
    }
  };

  const handleBlockCustomer = () => {
    setCustomer({ ...customer, isBlocked: true });
    setShowBlockModal(false);
  };

  return (
    <>
       <div className="h-screen text-white overflow-auto max-w-md m-auto">
  
      <div className="min-h-screen bg-linear-to-br from-[#1B1F28] via-[#1e232d] to-[#2d3139] px-4 py-6 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">

          <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden border ${customer.isBlocked ? "border-red-500/50" : "border-emerald-500/20"}`}>
            
            {customer.isBlocked && (
              <div className="bg-red-600 text-white text-center py-3 font-bold text-sm md:text-base">
                این مشتری بلاک شده است
              </div>
            )}

            <div className="p-5 md:p-8">

              {/* هدر - اطلاعات + دکمه‌ها */}
              <div className={`flex flex-col gap-5 md:flex-row md:items-center md:justify-between pb-6 border-b-2 border-dashed border-gray-200 ${customer.isBlocked ? "pt-4" : ""}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg ${customer.isBlocked ? "bg-red-100 text-red-700" : "bg-linear-to-br from-emerald-100 to-emerald-200 text-emerald-700"}`}>
                    {customer.name[0]}
                  </div>
                  <div className="text-right">
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">{customer.name}</h1>
                    <p className="text-sm md:text-base text-gray-600 font-medium">{customer.phone}</p>
                    <p className="text-sm md:text-base text-emerald-600 font-semibold">{customer.category}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* دکمه ارسال پیامک عمومی */}
                  <button
                    onClick={() => setShowGeneralSmsModal(true)}
                    disabled={customer.isBlocked}
                    className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${customer.isBlocked ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"}`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    ارسال پیامک
                  </button>

                  {/* دکمه بلاک */}
                  {!customer.isBlocked && (
                    <button
                      onClick={() => setShowBlockModal(true)}
                      className="w-full sm:w-auto px-5 py-3 bg-linear-to-r from-red-500 to-red-600 text-white font-bold text-sm rounded-xl hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Ban className="w-5 h-5" />
                      بلاک کردن
                    </button>
                  )}
                </div>
              </div>

              {/* آمار */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-8">
                <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4 border border-gray-200">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                  <div>
                    <p className="text-sm text-gray-600">تعداد کل نوبت‌ها</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{customer.totalAppointments}</h2>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 flex items-center gap-4 border border-gray-200">
                  <X className="w-10 h-10 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">تعداد کنسلی‌ها</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{customer.canceledAppointments}</h2>
                  </div>
                </div>
              </div>

              {/* لیست نوبت‌ها */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-emerald-500" />
                  لیست نوبت‌ها
                </h3>
                <div className="space-y-4">
                  {customer.appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className={`bg-white rounded-xl shadow-md p-5 border ${appt.status === "canceled" ? "border-red-300 bg-red-50 opacity-80" : "border-emerald-500/10 hover:border-emerald-500/30"} transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-800">{appt.date}</span>
                            <span className="text-gray-600 text-sm">{appt.time}</span>
                            {appt.status === "canceled" && (
                              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">کنسل شده</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{appt.note}</p>
                        </div>

                        {appt.status !== "canceled" && !customer.isBlocked && (
                          <button
                            onClick={() => setShowCancelModal(appt.id)}
                            className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors self-start sm:self-center"
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
      </div>

      {/* مودال ارسال پیامک عمومی */}
      {showGeneralSmsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                ارسال پیامک به {customer.name}
              </h3>
              <button onClick={() => { setShowGeneralSmsModal(false); setGeneralSmsMessage(""); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={generalSmsMessage}
              onChange={(e) => setGeneralSmsMessage(e.target.value)}
              placeholder="متن پیامک خود را اینجا بنویسید..."
              className="w-full text-black h-40 p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 resize-none text-sm"
            />
            <div className="flex flex-col sm:flex-row-reverse gap-3 mt-5">
              <button
                onClick={handleSendGeneralSms}
                disabled={!generalSmsMessage.trim()}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!generalSmsMessage.trim() ? "bg-gray-400 text-gray-600" : "bg-linear-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg"}`}
              >
                <Send className="w-5 h-5" />
                ارسال پیامک
              </button>
              <button onClick={() => { setShowGeneralSmsModal(false); setGeneralSmsMessage(""); }} className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال کنسل نوبت با گزینه پیامک کنسلی */}
      {showCancelModal !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-5">
              <AlertCircle className="w-8 h-8" />
              <h3 className="text-lg font-bold">کنسل کردن نوبت</h3>
            </div>

            <p className="text-sm text-gray-700 mb-5">
              آیا مطمئن هستید که می‌خواهید این نوبت را کنسل کنید؟
            </p>

            <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendCancellationSms}
                onChange={(e) => setSendCancellationSms(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                ارسال پیامک اطلاع‌رسانی کنسلی به مشتری
              </span>
            </label>

            {sendCancellationSms && (
              <div className="mb-5">
                <textarea
                  value={cancellationMessage}
                  onChange={(e) => setCancellationMessage(e.target.value)}
                  placeholder="متن پیامک کنسلی (مثال: با عرض پوزش، نوبتی که برای ۳۰ آبان رزرو کرده بودید کنسل شد.)"
                  className="w-full text-black h-28 p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 resize-none text-sm"
                />
                {!cancellationMessage.trim() && (
                  <p className="text-xs text-red-500 mt-1">لطفاً پیام را وارد کنید</p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={() => handleCancelAppointment(showCancelModal)}
                disabled={sendCancellationSms && !cancellationMessage.trim()}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${sendCancellationSms && !cancellationMessage.trim() ? "bg-gray-400 text-gray-600 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
              >
                کنسل کن
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(null);
                  setSendCancellationSms(false);
                  setCancellationMessage("");
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال بلاک کردن */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-5">
              <Ban className="w-8 h-8" />
              <h3 className="text-lg font-bold">بلاک کردن مشتری</h3>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              آیا از بلاک کردن <strong>{customer.name}</strong> مطمئن هستید؟
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button onClick={handleBlockCustomer} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">
                بله، بلاک کن
              </button>
              <button onClick={() => setShowBlockModal(false)} className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300">
                لغو
              </button>
            </div>
          </div>
        </div>
        
      )}
          <Footer/>
          </div>
    </>
  );
}