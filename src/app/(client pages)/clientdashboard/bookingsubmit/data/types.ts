export interface Service {
  id: number;
  name: string;
  duration_minutes: number;
  is_active: boolean;
}

export interface JalaliDate {
  year: number;
  month: number;
  day: number | null;
}

export interface BookingFormData {
  name: string;
  phone: string;
  selectedDate: JalaliDate;
  selectedTime: string;
  selectedServices: Service[];
  notes: string;
  sendReservationSms: boolean;
  sendReminderSms: boolean;
  reservationMessage: string;
  reminderMessage: string;
  reminderTime: number;
}