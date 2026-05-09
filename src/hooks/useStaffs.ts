import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Service {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;  // اعتبار باقی‌مانده
  sms_used: number;     // اضافه شد - پیامک مصرف شده
  service_ids: string | null;
  services: Service[];
  calendar_type: "synced" | "independent";
  can_see_all_clients: boolean;
  is_active: boolean;
  active_bookings?: number;
  created_at: string;
}

interface CreateStaffData {
  name: string;
  phone: string;
  sms_balance?: number;
  service_ids?: string;
  calendar_type?: "synced" | "independent";
  can_see_all_clients?: boolean;
}

interface UpdateStaffData {
  id: number;
  name?: string;
  phone?: string;
  sms_balance?: number;
  service_ids?: string | null;
  calendar_type?: "synced" | "independent";
  can_see_all_clients?: boolean;
  is_active?: boolean;
}

// دریافت لیست پرسنل
export const useStaffs = () => {
  return useQuery({
    queryKey: ["staffs"],
    queryFn: async () => {
      const res = await fetch("/api/client/staffs");
      if (!res.ok) throw new Error("خطا در دریافت لیست پرسنل");
      const data = await res.json();
      return data as { success: boolean; staffs: Staff[] };
    },
  });
};

// دریافت یک پرسنل
export const useStaff = (id: number | null) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/client/staffs?id=${id}`);
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات پرسنل");
      const data = await res.json();
      return data as { success: boolean; staff: Staff };
    },
    enabled: !!id,
  });
};

// دریافت مشتریان پرسنل
export const useStaffClients = (staffId: number | null) => {
  return useQuery({
    queryKey: ["staff-clients", staffId],
    queryFn: async () => {
      if (!staffId) return null;
      const res = await fetch(`/api/client/staffs/clients?staffId=${staffId}`);
      if (!res.ok) throw new Error("خطا در دریافت مشتریان");
      const data = await res.json();
      return data as { success: boolean; clients: any[]; staff: Staff };
    },
    enabled: !!staffId,
  });
};

// ایجاد پرسنل
export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStaffData) => {
      const res = await fetch("/api/client/staffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "خطا در ایجاد پرسنل");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

// ویرایش پرسنل
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStaffData) => {
      const res = await fetch("/api/client/staffs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "خطا در ویرایش پرسنل");
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      queryClient.invalidateQueries({ queryKey: ["staff", variables.id] });
    },
  });
};

// حذف پرسنل
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch("/api/client/staffs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "خطا در حذف پرسنل");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

// دریافت خدمات کاربر
export const useUserServices = () => {
  return useQuery({
    queryKey: ["user-services"],
    queryFn: async () => {
      const res = await fetch("/api/client/services");
      if (!res.ok) throw new Error("خطا در دریافت خدمات");
      const data = await res.json();
      return data as { success: boolean; services: any[] };
    },
  });
};
