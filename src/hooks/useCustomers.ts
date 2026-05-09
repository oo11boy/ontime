import { useMutation } from "@tanstack/react-query";
import { useApiQuery, useApiMutation } from "./useApi";
import { useUserType } from "./useUserType";

// اینترفیس‌ها
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
  bookings_with_this_staff?: number; // برای پرسنل
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
  staffInfo?: {
    can_see_all_clients: boolean;
  };
}

export const useCustomers = (page: number = 1, search: string = "") => {
  const { userType, staffId } = useUserType();

  const params = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(search && { search }),
  });

  // اضافه کردن staffId به queryKey برای ریفرش صحیح
  const queryKey = ["customers", page, search, userType, staffId];

  return useApiQuery<CustomersResponse>(
    queryKey,
    `/api/client/customers?${params}`,
    { staleTime: 2 * 60 * 1000 },
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
  const { userType, staffId } = useUserType();

  return useApiQuery<CustomerProfileResponse>(
    ["customer", phone, userType, staffId],
    `/api/client/customers/${phone}`,
    { enabled: !!phone },
  );
};

export const useCheckCustomer = (onSuccessCallback?: (data: any) => void) => {
  const { userType, staffId } = useUserType();

  return useMutation({
    mutationFn: async (phone: string) => {
      const cleanedPhone = phone.replace(/\D/g, "").slice(-10);
      let url = `/api/client/customers/checkcustomerexist?phone=${encodeURIComponent(cleanedPhone)}`;

      // اگر پرسنل است، staffId را هم ارسال کن
      if (userType === "staff" && staffId) {
        url += `&staffId=${staffId}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      return res.json();
    },
    onSuccess: (data) => {
      if (onSuccessCallback) onSuccessCallback(data);
    },
  });
};

export const useBlockCustomer = () => {
  return useApiMutation("POST", "/api/client/customers", [["customers"]]);
};

// هوک برای دریافت مشتریان یک پرسنل خاص (برای استفاده در پنل پرسنل)
export const useStaffCustomers = (staffId: number | null) => {
  return useApiQuery<CustomersResponse>(
    ["staff-customers", staffId],
    staffId ? `/api/client/staffs/clients?staffId=${staffId}` : null,
    { enabled: !!staffId },
  );
};
