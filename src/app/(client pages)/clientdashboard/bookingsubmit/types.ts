export interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface SelectedDate {
  year: number;
  month: number;
  day: number | null;
}

export interface ExistingClient {
  exists: boolean;
  name?: string;
  totalBookings?: number;
  lastBookingDate?: string;
  isBlocked?: boolean;
}