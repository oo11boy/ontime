export interface Appointment {
  id: number;
  client_name: string;
  client_phone: string;
  booking_date: string;
  booking_time: string;
  services: string;
  status: "active" | "cancelled" | "done";
  booking_description?: string;
  sms_reserve_enabled: boolean;
  sms_reminder_enabled: boolean;
  sms_reminder_hours_before?: number;
}

export interface DashboardBookingCardProps {
    appointment: Appointment;
}
