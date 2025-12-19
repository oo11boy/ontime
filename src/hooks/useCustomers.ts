// hooks/useCustomers.ts
import { useMutation } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "./useApi";

interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  total_bookings: number;
  cancelled_count: number;
  is_blocked: boolean;
  last_booking_date: string;
  last_booking_time: string;
}

interface CustomersResponse {
  success: boolean;
  clients: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useCustomers = (page: number = 1, search: string = "") => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(search && { search }),
  });

  return useApiQuery<CustomersResponse>(
    ["customers", search],
    `/api/client/customers?${params}`,
    { staleTime: 2 * 60 * 1000 }
  );
};

export interface CustomerProfileResponse {
  success: boolean;
  client: {
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
  };
  appointments: {
    id: number;
    date: string;
    time: string;
    note: string;
    services: string;
    displayStatus: "pending" | "completed" | "canceled";
  }[];
}
export const useCustomerProfile = (phone: string) => {
  return useApiQuery<CustomerProfileResponse>(
    ["customer", phone],
    `/api/client/customers/${phone}`,
    { enabled: !!phone }
  );
};
export const useCheckCustomer = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const cleanedPhone = phone.replace(/\D/g, "");
      const res = await fetch(
        `/api/client/customers/checkcustomerexist?phone=${encodeURIComponent(cleanedPhone)}`
      );
      return res.json();
    },
  });
};

export const useBlockCustomer = () => {
  return useApiMutation("POST", "/api/client/customers", [
    ["customers"],
  ]);
};