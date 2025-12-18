"use client";
import  { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Footer from "../../../components/Footer/Footer";
import { formatPersianDate, formatPersianDateTime } from "@/lib/date-utils";
import { LoadingScreen } from "./components/LoadingScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { HeaderSection } from "./components/HeaderSection";
import { CustomerHeader } from "./components/CustomerHeader";
import { ActionButtons } from "./components/ActionButtons";
import { StatisticsGrid } from "./components/StatisticsGrid";
import { AppointmentsList } from "./components/AppointmentsList";
import { SmsModal } from "./components/SmsModal";
import { CancelAppointmentModal } from "./components/CancelAppointmentModal";
import { BlockModal } from "./components/BlockModal";

interface Appointment {
  id: number;
  date: string;
  time: string;
  note: string;
  services: string;
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
  const phone = params?.phone as string;

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

  // دریافت اطلاعات مشتری
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/client/customers/${phone}`);
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

  useEffect(() => {
    if (phone) {
      fetchCustomerData();
    }
  }, [phone]);

  // کنسل کردن نوبت
  const handleCancelAppointment = async (apptId: number) => {
    try {
      setCanceling(true);

      const response = await fetch("/api/client/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apptId }),
      });

      if (response.ok) {
        if (sendCancellationSms && cancellationMessage.trim() && customer) {
          await fetch(`/api/client/customers/${customer.phone}`, {
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

  // ارسال پیامک عمومی
  const handleSendGeneralSms = async () => {
    if (!customer || !generalSmsMessage.trim()) return;
    try {
      setSendingSms(true);
      const response = await fetch(`/api/client/customers/${customer.phone}`, {
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

  // بلاک کردن مشتری
  const handleBlockCustomer = async () => {
    if (!customer) return;
    try {
      setBlocking(true);
      const response = await fetch("/api/client/customers", {
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

  // رفع بلاک مشتری
  const handleUnblockCustomer = async () => {
    if (!customer) return;
    try {
      setBlocking(true);
      const response = await fetch("/api/client/customers", {
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

  // توابع کمکی
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
    return <LoadingScreen />;
  }

  if (!customer) {
    return <ErrorScreen/>;
  }

  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="min-h-screen bg-linear-to-br from-[#1a1e26] to-[#242933] text-white pb-32">
        <div className="max-w-2xl mx-auto">
          <HeaderSection />

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

            <CustomerHeader
              customer={customer}
              formatPhoneStr={formatPhoneStr}
              getPersianDate={getPersianDate}
            />

            <div className="px-6">
              <ActionButtons
                customer={customer}
                onShowSmsModal={() => setShowGeneralSmsModal(true)}
                onShowBlockModal={() => setShowBlockModal(true)}
                onShowUnblockModal={() => setShowUnblockModal(true)}
              />

              <StatisticsGrid customer={customer} />

              <AppointmentsList
                appointments={appointments}
                customerIsBlocked={customer.is_blocked}
                getPersianDateTime={getPersianDateTime}
                onShowCancelModal={setShowCancelModal}
              />
            </div>
          </div>
        </div>

        {/* Modals */}
        <SmsModal
          isOpen={showGeneralSmsModal}
          customerName={customer.name}
          message={generalSmsMessage}
          sendingSms={sendingSms}
          onClose={() => {
            setShowGeneralSmsModal(false);
            setGeneralSmsMessage("");
          }}
          onMessageChange={setGeneralSmsMessage}
          onSend={handleSendGeneralSms}
        />

        <CancelAppointmentModal
          isOpen={showCancelModal !== null}
          appointmentId={showCancelModal}
          sendCancellationSms={sendCancellationSms}
          cancellationMessage={cancellationMessage}
          canceling={canceling}
          onClose={() => {
            setShowCancelModal(null);
            setSendCancellationSms(false);
            setCancellationMessage("");
          }}
          onToggleSmsCheckbox={setSendCancellationSms}
          onMessageChange={setCancellationMessage}
          onCancelAppointment={() => 
            showCancelModal && handleCancelAppointment(showCancelModal)
          }
        />

        <BlockModal
          isOpen={showBlockModal}
          isUnblock={false}
          blocking={blocking}
          onClose={() => setShowBlockModal(false)}
          onConfirm={handleBlockCustomer}
        />

        <BlockModal
          isOpen={showUnblockModal}
          isUnblock={true}
          blocking={blocking}
          onClose={() => setShowUnblockModal(false)}
          onConfirm={handleUnblockCustomer}
        />
      </div>
      <Footer />
    </div>
  );
}