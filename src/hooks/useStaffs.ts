import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

interface Service {
  id: number;
  name: string;
}

interface Staff {
  id: number;
  name: string;
  phone: string;
  sms_balance: number;
  sms_used: number;
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
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
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

// حذف پرسنل (با پشتیبانی از حذف اجباری)
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, force = false }: { id: number; force?: boolean }) => {
      const res = await fetch("/api/client/staffs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, force }),
      });
      const result = await res.json();
      if (!res.ok) {
        // اگر خطای 409 (نوبت فعال دارد) باشد، داده‌های نوبت‌ها را برگردان
        if (res.status === 409 && result.hasActiveBookings) {
          throw new Error(JSON.stringify(result));
        }
        throw new Error(result.message || "خطا در حذف پرسنل");
      }
      return result;
    },
    onSuccess: (data, variables) => {
      if (variables.force && data.cancelled_bookings_count > 0) {
        toast.success(
          `پرسنل با موفقیت حذف شد. ${data.cancelled_bookings_count} نوبت فعال لغو گردید.`,
          { duration: 5000 }
        );
      } else {
        toast.success(data.message || "پرسنل با موفقیت حذف شد");
      }
      if (data.refunded_sms && data.refunded_sms > 0) {
        toast.success(`${data.refunded_sms} پیامک به حساب اصلی برگشت`);
      }
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: any) => {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.hasActiveBookings) {
          // این خطا باید در کامپوننت مدیریت شود
          throw new Error(JSON.stringify({ ...errorData, needForceDelete: true }));
        }
        toast.error(errorData.message || "خطا در حذف پرسنل");
      } catch {
        toast.error(error.message || "خطا در حذف پرسنل");
      }
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