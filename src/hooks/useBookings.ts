import { Appointment } from "@/types";
import { useApiQuery, useApiMutation } from "./useApi";

interface BookingsResponse {
  success: boolean;
  bookings: Appointment[];
}

// ساختار واقعی پاسخ API اخیر
interface RecentBookingsResponse {
  success: boolean;
  appointments: Appointment[]; // ← اینجا appointments است نه bookings
}

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

export const useCreateBooking = () => {
  return useApiMutation("POST", "/api/client/bookings", [
    ["bookings"],
    ["dashboard"],
    ["customers"], 
    ["customers", ""],          
  ]);
};

export const useCancelBooking = () => {
  return useApiMutation("DELETE", "/api/client/bookings", [
    ["bookings"],
    ["dashboard"],
  ]);
};