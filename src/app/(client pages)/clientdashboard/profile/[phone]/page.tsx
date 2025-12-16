// File Path: src/app/(client pages)/clientdashboard/profile/[phone]/page.tsx
"use client";
import React, { useState, useEffect } from "react";
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
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { useRouter, useParams } from "next/navigation";
// اطمینان حاصل کنید مسیر Footer صحیح است. معمولا @/components بهتر است.
import Footer from "../../components/Footer/Footer"; 
import { formatPersianDate, formatPersianDateTime } from "@/lib/date-utils";

interface Appointment {
  id: number;
  date: string;
  formattedDate: string;
  time: string;
  note: string;
  services: string;
  status: string;
  displayStatus: "pending" | "completed" | "canceled";
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  category: string;
  is_blocked: boolean;
  totalAppointments: number;
  canceledAppointments: number;
  completedAppointments: number;
  activeAppointments: number;
  joinDate: string;
}

export default function CustomerProfile() {
  const router = useRouter();
  const params = useParams();
  const phone = params?.phone as string; // اضافه کردن Safe check

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [showGeneralSmsModal, setShowGeneralSmsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);

  // Actions State
  const [sendCancellationSms, setSendCancellationSms] = useState(false);
  const [cancellationMessage, setCancellationMessage] = useState("");
  const [generalSmsMessage, setGeneralSmsMessage] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (phone) {
      fetchCustomerData();
    }
  }, [phone]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clientslist/${phone}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.client);
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apptId: number) => {
    try {
      setCanceling(true);

      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apptId }),
      });

      if (response.ok) {
        if (sendCancellationSms && cancellationMessage.trim() && customer) {
          await fetch(`/api/clientslist/${customer.phone}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: cancellationMessage.trim() }),
          });
        }

        setAppointments(
          appointments.map((appt) =>
            appt.id === apptId
              ? { ...appt, displayStatus: "canceled" as const }
              : appt
          )
        );

        if (customer) {
          setCustomer({
            ...customer,
            canceledAppointments: customer.canceledAppointments + 1,
            activeAppointments: customer.activeAppointments - 1,
          });
        }
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
    } finally {
      setCanceling(false);
      setShowCancelModal(null);
      setSendCancellationSms(false);
      setCancellationMessage("");
    }
  };

  const handleSendGeneralSms = async () => {
    if (!customer || !generalSmsMessage.trim()) return;
    try {
      setSendingSms(true);
      const response = await fetch(`/api/clientslist/${customer.phone}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: generalSmsMessage.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setShowGeneralSmsModal(false);
        setGeneralSmsMessage("");
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
    } finally {
      setSendingSms(false);
    }
  };

  const handleBlockCustomer = async () => {
    if (!customer) return;
    try {
      setBlocking(true);
      const response = await fetch("/api/clientslist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block",
          clientId: customer.id,
          phone: customer.phone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCustomer({ ...customer, is_blocked: true });
        setAppointments(
          appointments.map((appt) =>
            appt.displayStatus === "pending"
              ? { ...appt, displayStatus: "canceled" as const }
              : appt
          )
        );
      }
    } catch (error) {
      console.error("Error blocking customer:", error);
    } finally {
      setBlocking(false);
      setShowBlockModal(false);
    }
  };

  const handleUnblockCustomer = async () => {
    if (!customer) return;
    try {
      setBlocking(true);
      const response = await fetch("/api/clientslist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unblock",
          clientId: customer.id,
          phone: customer.phone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCustomer({ ...customer, is_blocked: false });
      }
    } catch (error) {
      console.error("Error unblocking customer:", error);
    } finally {
      setBlocking(false);
      setShowUnblockModal(false);
    }
  };

  const formatPhoneStr = (p: string) => {
    if (p && p.length === 11) {
      return `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}`;
    }
    return p;
  };

  const getPersianDate = (dateStr: string) => {
    try {
      return formatPersianDate(dateStr);
    } catch (error) {
      return dateStr;
    }
  };

  const getPersianDateTime = (dateStr: string, timeStr: string) => {
    try {
      return formatPersianDateTime(dateStr, timeStr);
    } catch (error) {
      return `${dateStr} - ${timeStr}`;
    }
  };

  if (loading) {
    return (
      <div className="h-screen text-white overflow-auto max-w-md m-auto">
        <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="h-screen text-white overflow-auto max-w-md m-auto">
        <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold mb-4">مشتری یافت نشد</h1>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-emerald-500 rounded-lg hover:bg-emerald-600 transition"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <div className="max-w-2xl mx-auto">
          <header className="sticky top-0 z-50 bg-[#0f1117]/90 backdrop-blur-xl border-b border-white/10 px-5 py-3 flex justify-between items-center">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center active:scale-90"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold">پروفایل مشتری</h1>
            <div className="w-10"></div>
          </header>

          <div
            className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border ${
              customer.is_blocked
                ? "border-red-500/50"
                : "border-emerald-500/20"
            } overflow-hidden shadow-2xl m-4`}
          >
            {customer.is_blocked && (
              <div className="bg-linear-to-r from-red-600 to-red-700 text-white text-center py-3.5 font-bold text-sm shadow-lg">
                این مشتری بلاک شده است
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-xl ${
                      customer.is_blocked
                        ? "bg-red-500/20 text-red-400"
                        : "bg-linear-to-br from-emerald-500 to-emerald-600"
                    }`}
                  >
                    {customer.name[0]}
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-bold">{customer.name}</h1>
                    <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      {formatPhoneStr(customer.phone)}
                    </p>
                    <p className="text-emerald-400 text-sm font-medium mt-2">
                      {customer.category || "بدون دسته‌بندی"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      عضو از {getPersianDate(customer.joinDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <button
                  onClick={() => setShowGeneralSmsModal(true)}
                  disabled={customer.is_blocked}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                    customer.is_blocked
                      ? "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      : "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  ارسال پیامک
                </button>

                {customer.is_blocked ? (
                  <button
                    onClick={() => setShowUnblockModal(true)}
                    className="flex-1 py-3.5 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 active:scale-95 shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    رفع بلاک
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="flex-1 py-3.5 bg-linear-to-r from-red-500 to-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 active:scale-95 shadow-lg"
                  >
                    <Ban className="w-5 h-5" />
                    بلاک کردن
                  </button>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-5 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">کل نوبت‌ها</p>
                  <p className="text-2xl font-bold mt-1">
                    {customer.totalAppointments}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-red-500/20 text-center">
                  <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">کنسلی‌ها</p>
                  <p className="text-2xl font-bold mt-1 text-red-400">
                    {customer.canceledAppointments}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-blue-500/20 text-center">
                  <Calendar className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">انجام شده</p>
                  <p className="text-2xl font-bold mt-1 text-blue-400">
                    {customer.completedAppointments}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-5 border border-yellow-500/20 text-center">
                  <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">در انتظار</p>
                  <p className="text-2xl font-bold mt-1 text-yellow-400">
                    {customer.activeAppointments}
                  </p>
                </div>
              </div>

              {/* Appointments List */}
              <div>
                <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-emerald-400" />
                  نوبت‌های ثبت شده
                </h3>

                <div className="space-y-4">
                  {appointments.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">
                      هیچ نوبتی ثبت نشده است
                    </p>
                  ) : (
                    appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className={`bg-white/5 backdrop-blur-sm rounded-xl p-5 border transition-all ${
                          appt.displayStatus === "canceled"
                            ? "border-red-500/40 opacity-70"
                            : appt.displayStatus === "completed"
                            ? "border-blue-500/20"
                            : "border-emerald-500/20 hover:border-emerald-500/40 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 text-right">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <span className="font-bold text-white">
                                {getPersianDateTime(appt.date, appt.time)}
                              </span>
                              <span
                                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                  appt.displayStatus === "canceled"
                                    ? "bg-red-500/20 text-red-400"
                                    : appt.displayStatus === "completed"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-emerald-500/20 text-emerald-400"
                                }`}
                              >
                                {appt.displayStatus === "canceled"
                                  ? "کنسل شده"
                                  : appt.displayStatus === "completed"
                                  ? "انجام شده"
                                  : "در انتظار"}
                              </span>
                            </div>
                            {appt.services && (
                              <p className="text-sm text-gray-300 mb-1">
                                خدمات: {appt.services}
                              </p>
                            )}
                            {appt.note && (
                              <p className="text-sm text-gray-300">
                                {appt.note}
                              </p>
                            )}
                          </div>

                          {appt.displayStatus === "pending" &&
                            !customer.is_blocked && (
                              <button
                                onClick={() => setShowCancelModal(appt.id)}
                                className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}

        {/* SMS Modal */}
        {showGeneralSmsModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGeneralSmsModal(false)}
          >
            <div
              className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-emerald-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                  ارسال پیامک به {customer?.name}
                </h3>
                <button
                  onClick={() => setShowGeneralSmsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <textarea
                value={generalSmsMessage}
                onChange={(e) => setGeneralSmsMessage(e.target.value)}
                placeholder="متن پیامک را اینجا بنویسید..."
                className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 h-40 resize-none"
                dir="rtl"
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleSendGeneralSms}
                  disabled={!generalSmsMessage.trim() || sendingSms}
                  className={`flex-1 py-3.5 rounded-xl font-bold transition-all ${
                    generalSmsMessage.trim() && !sendingSms
                      ? "bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  } flex items-center justify-center gap-2`}
                >
                  {sendingSms ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {sendingSms ? "در حال ارسال..." : "ارسال پیامک"}
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

        {/* Cancel Modal */}
        {showCancelModal !== null && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCancelModal(null)}
          >
            <div
              className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-400 mb-5">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-xl font-bold">کنسل کردن نوبت</h3>
              </div>
              <p className="text-gray-300 mb-6">
                آیا از کنسل کردن این نوبت مطمئن هستید؟
              </p>

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
                  dir="rtl"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleCancelAppointment(showCancelModal)}
                  disabled={
                    (sendCancellationSms && !cancellationMessage.trim()) ||
                    canceling
                  }
                  className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 ${
                    (sendCancellationSms && !cancellationMessage.trim()) ||
                    canceling
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {canceling ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "کنسل کن"
                  )}
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

        {/* Block Modal */}
        {showBlockModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBlockModal(false)}
          >
            <div
              className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-red-400 mb-5">
                <Ban className="w-8 h-8" />
                <h3 className="text-xl font-bold">مسدود کردن مشتری</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                با مسدود کردن این مشتری، تمام نوبت‌های آینده او کنسل شده و امکان
                دریافت نوبت جدید نخواهد داشت.
                <br />
                آیا مطمئن هستید؟
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleBlockCustomer}
                  disabled={blocking}
                  className="flex-1 py-3.5 bg-linear-to-r from-red-600 to-red-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition"
                >
                  {blocking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "بله، بلاک کن"
                  )}
                </button>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unblock Modal */}
        {showUnblockModal && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUnblockModal(false)}
          >
            <div
              className="bg-[#242933] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-green-500/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 text-green-400 mb-5">
                <CheckCircle className="w-8 h-8" />
                <h3 className="text-xl font-bold">رفع مسدودیت مشتری</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                آیا از رفع مسدودیت این مشتری اطمینان دارید؟ او مجدداً قادر به
                رزرو نوبت خواهد بود.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleUnblockCustomer}
                  disabled={blocking}
                  className="flex-1 py-3.5 bg-linear-to-r from-green-500 to-green-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition"
                >
                  {blocking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "بله، رفع بلاک کن"
                  )}
                </button>
                <button
                  onClick={() => setShowUnblockModal(false)}
                  className="flex-1 py-3.5 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}