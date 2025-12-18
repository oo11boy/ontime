export interface Client {
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

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  userSmsBalance: number;
  onSend: (message: string, clientIds: string[]) => Promise<void>;
}

export interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}