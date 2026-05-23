export interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface Shift {
  start: string;
  end: string;
}

export interface BusinessData {
  id: string;
  slug: string;
  business_name: string;
  business_address: string;
  phone: string;
  bio: string;
  logo: string | null;
  social_media: any;
  services: Service[];
  work_shifts: Shift[];
  off_days: number[];
  total_visits: number;
}

export interface CustomerBooking {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  services: string | null;
  status: "active" | "cancelled" | "done" | "pending" | "rejected";
  created_at: string;
  change_count?: number;
  has_pending_reschedule?: boolean;
  has_pending_cancel?: boolean;
  can_cancel?: boolean;
  can_reschedule?: boolean;
  customer_token?: string;
}

export interface CustomerData {
  id: number;
  name: string;
  phone: string;
  slug: string;
}