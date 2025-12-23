import { Appointment } from "@/types";
import { useApiQuery, useApiMutation } from "./useApi";

// --- Interfaces ---
interface BookingsResponse {
  success: boolean;
  bookings: Appointment[];
}
interface RecentBookingsResponse {
  success: boolean;
  appointments: Appointment[];
}
interface CreateBookingResponse {
  success: boolean;
  message: string;
  bookingId: number;
  customerToken: string;
  bookingLink: string;
}
interface CancelBookingResponse {
  success: boolean;
  message: string;
}
interface UpdateBookingResponse {
  success: boolean;
  message: string;
  booking?: Appointment;
}
interface SingleBookingResponse {
  success: boolean;
  booking: Appointment;
}

// --- Hooks ---

export const useBookings = () => {
  return useApiQuery<BookingsResponse>(["bookings"], "/api/client/bookings");
};

export const useRecentBookings = () => {
  return useApiQuery<RecentBookingsResponse>(
    ["bookings", "recent"],
    "/api/client/bookings/recent",
    { staleTime: 1 * 60 * 1000 }
  );
};

export const useBookingById = (id?: number) => {
  return useApiQuery<SingleBookingResponse>(
    ["bookings", id],
    id ? `/api/client/bookings/${id}` : null,
    { enabled: !!id }
  );
};

export const useCreateBooking = () => {
  // اصلاح شد: حالا دو آرگومان تایپی قبول می‌کند
  return useApiMutation<CreateBookingResponse, any>(
    "POST",
    "/api/client/bookings",
    [["bookings"], ["dashboard"], ["customers"], ["customers", ""]]
  );
};

export const useCancelBooking = () => {
  return useApiMutation<CancelBookingResponse, { id: number }>(
    "DELETE",
    "/api/client/bookings",
    [["bookings"], ["dashboard"], ["bookings", "recent"]]
  );
};

export const useUpdateBooking = () => {
  return useApiMutation<
    UpdateBookingResponse,
    { id: number; [key: string]: any }
  >("PATCH", "/api/client/bookings", [["bookings"], ["dashboard"]]);
};

export const useCustomerBooking = (token: string) => {
  return useApiQuery<{
    success: boolean;
    booking: any; // می‌توانید این را با جزئیات دقیق‌تر تایپ کنید
  }>(
    ["customer-booking", token],
    token ? `/api/customer-booking?token=${token}` : null,
    {
      enabled: !!token,
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCustomerBookingActions = () => {
  const cancelMutation = useApiMutation<
    { success: boolean; message: string },
    { token: string; action: string }
  >("POST", "/api/customer-booking", []);

  const rescheduleMutation = useApiMutation<
    { success: boolean; message: string },
    {
      token: string;
      action: string;
      data: { newDate: string; newTime: string };
    }
  >("POST", "/api/customer-booking", []);

  const cancelBooking = async (token: string) => {
    return cancelMutation.mutateAsync({
      token,
      action: "cancel",
    });
  };

  const rescheduleBooking = async (
    token: string,
    newDate: string,
    newTime: string
  ) => {
    return rescheduleMutation.mutateAsync({
      token,
      action: "reschedule",
      data: { newDate, newTime },
    });
  };

  return {
    cancelBooking,
    rescheduleBooking,
    isCancelling: cancelMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    cancelError: cancelMutation.error,
    rescheduleError: rescheduleMutation.error,
  };
};

export const useAvailableTimes = (date?: string, duration?: number) => {
  // اصلاح شد: آدرس URL فقط در صورت وجود مقادیر ساخته می‌شود
  const url =
    date && duration
      ? `/api/available-times?date=${encodeURIComponent(
          date
        )}&duration=${duration}`
      : null;

  return useApiQuery<{
    success: boolean;
    availableTimes: string[];
    bookedTimes: any[];
    currentTime: string;
    isToday: boolean;
  }>(["available-times", date, duration], url, {
    enabled: !!date && !!duration,
    staleTime: 30 * 1000,
  });
};

export const useBookingLink = () => {
  const getBookingLink = (customerToken: string) =>
    `${window.location.origin}/customer/booking/${customerToken}`;

  const copyBookingLink = async (customerToken: string) => {
    const link = getBookingLink(customerToken);
    try {
      await navigator.clipboard.writeText(link);
      return { success: true, link };
    } catch {
      return { success: false, link };
    }
  };

  const shareBookingLink = async (
    customerToken: string,
    clientName: string
  ) => {
    const link = getBookingLink(customerToken);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `نوبت ${clientName}`,
          url: link,
        });
        return { success: true, link };
      } catch (error) {
        return { success: false, link, error };
      }
    }
    return copyBookingLink(customerToken);
  };

  return {
    copyBookingLink,
    shareBookingLink,
    getBookingLink,
    generateSmsWithLink: (token: string, msg: string) =>
      `${msg}\n\n🔗 لینک نوبت:\n${getBookingLink(token)}`,
  };
};
