"use client";

import { useState } from "react";
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
import { useCustomerProfile } from "@/hooks/useCustomers";
import toast from "react-hot-toast";
import { useSendSingleSms } from "@/hooks/useSendSms";

export default function CustomerProfile() {
  const sendSingleSmsMutation = useSendSingleSms();

  const params = useParams();
  const phone = params?.phone as string;

  const { data: customerData, isLoading, refetch } = useCustomerProfile(phone);

  const customer = customerData?.client || null;
  const appointments = customerData?.appointments || [];

  const [showGeneralSmsModal, setShowGeneralSmsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null);

  const [sendCancellationSms, setSendCancellationSms] = useState(false);
  const [selectedCancellationTemplateKey, setSelectedCancellationTemplateKey] = useState<string | null>(null);
  const [generalSmsMessage, setGeneralSmsMessage] = useState("");
  const [sendingSms, setSendingSms] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const handleCancelAppointment = async (apptId: number, templateKey?: string | null) => {
    try {
      setCanceling(true);

      const response = await fetch("/api/client/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: apptId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "خطا در کنسل کردن نوبت");
      }

      if (sendCancellationSms && templateKey && customer) {
        try {
          await sendSingleSmsMutation.mutateAsync({
            to_phone: customer.phone,
            sms_type: "cancellation",
            booking_id: apptId,
            template_key: templateKey,
          });
          toast.success("پیامک کنسل کردن نوبت ارسال شد");
        } catch (smsError) {
          toast.error("ارسال پیامک کنسل با خطا مواجه شد");
        }
      }

      await refetch();
      toast.success("نوبت با موفقیت کنسل شد");
    } catch (error) {
      toast.error("خطا در کنسل کردن نوبت");
    } finally {
      setCanceling(false);
      setShowCancelModal(null);
      setSendCancellationSms(false);
      setSelectedCancellationTemplateKey(null);
    }
  };

  const handleSendGeneralSms = async () => {
    if (!customer || !generalSmsMessage.trim()) return;

    try {
      setSendingSms(true);
      await sendSingleSmsMutation.mutateAsync({
        to_phone: customer.phone,
        content: generalSmsMessage.trim(),
        sms_type: "individual",
      });
      setShowGeneralSmsModal(false);
      setGeneralSmsMessage("");
    } catch (error) {
      toast.error("ارسال پیامک با خطا مواجه شد");
    } finally {
      setSendingSms(false);
    }
  };

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

      if (response.ok) {
        await refetch();
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
      const response = await fetch("/api/client/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unblock",
          clientId: customer.id,
          phone: customer.phone,
        }),
      });

      if (response.ok) {
        await refetch();
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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!customer) {
    return <ErrorScreen />;
  }

  return (
    <div className="h-screen overflow-auto max-w-md m-auto bg-slate-50 dark:bg-[#1a1e26] transition-colors">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#1a1e26] dark:to-[#242933] text-slate-800 dark:text-white pb-32 transition-colors">
        <div className="max-w-2xl mx-auto">
          <HeaderSection />

          <div
            className={`relative bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border ${
              customer.is_blocked
                ? "border-red-300 dark:border-red-500/50"
                : "border-emerald-200 dark:border-emerald-500/20"
            } overflow-hidden shadow-lg dark:shadow-2xl m-4`}
          >
            {customer.is_blocked ? (
              <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white text-center py-3.5 font-bold text-sm shadow-lg">
                این مشتری بلاک شده است
              </div>
            ) : null}

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
          canceling={canceling}
          onClose={() => {
            setShowCancelModal(null);
            setSendCancellationSms(false);
            setSelectedCancellationTemplateKey(null);
          }}
          onToggleSmsCheckbox={setSendCancellationSms}
          onTemplateSelect={setSelectedCancellationTemplateKey}
          onCancelAppointment={() =>
            showCancelModal && handleCancelAppointment(showCancelModal, selectedCancellationTemplateKey)
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