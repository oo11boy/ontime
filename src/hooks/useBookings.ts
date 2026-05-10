import { Appointment } from "@/types";
import { useApiQuery, useApiMutation } from "./useApi";
import { useUserType } from "./useUserType";

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
  const { userType, staffId } = useUserType();
  
  return useApiQuery<BookingsResponse>(
    ["bookings", userType, staffId],
    "/api/client/bookings"
  );
};

export const useRecentBookings = () => {
  return useApiQuery<RecentBookingsResponse>(
    ["bookings", "recent"],
    "/api/client/bookings/recent",
    { staleTime: 30 * 1000, gcTime: 5 * 60 * 1000 }
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
    booking: any;
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

// hooks/useBookings.ts - بخش useAvailableTimes

export const useAvailableTimes = (date?: string, duration?: number) => {
  const { userType, staffId } = useUserType();
  
  let url = date && duration
    ? `/api/available-times?date=${encodeURIComponent(date)}&duration=${duration}`
    : null;
  
  // اگر پرسنل است، staffId را هم ارسال کن
  if (userType === "staff" && staffId && url) {
    url += `&staffId=${staffId}`;
  }

  return useApiQuery<{
    success: boolean;
    availableTimes: string[];
    bookedTimes: any[];
    allTimes: string[];
    currentTime: string;
    isToday: boolean;
  }>(["available-times", date, duration, userType, staffId], url, {
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