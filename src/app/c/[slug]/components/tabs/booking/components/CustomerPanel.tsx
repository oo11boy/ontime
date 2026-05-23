"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { motion } from "framer-motion";
import { LogIn, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Import from booking components
import { LoginModal } from "./LoginModal";
import { WelcomeCard } from "./WelcomeCard";
import { CustomerStatsCards } from "./CustomerStatsCards";
import { FilterTabs } from "./FilterTabs";
import { BookingsList } from "./BookingsList";
import { NewBookingModal } from "./NewBookingModal";
import { BusinessData, CustomerBooking, CustomerData } from "../../../shared/types";


export interface CustomerPanelRef {
  openNewBookingModal: () => void;
}

interface CustomerPanelProps {
  business: BusinessData;
  slug: string;
}

const CustomerPanel = forwardRef<CustomerPanelRef, CustomerPanelProps>(
  ({ business, slug }, ref) => {
    const [customer, setCustomer] = useState<CustomerData | null>(null);
    const [bookings, setBookings] = useState<CustomerBooking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showNewBookingModal, setShowNewBookingModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const hasLoadedBookings = useRef(false);
    const lastCustomerPhone = useRef<string>("");

    useImperativeHandle(ref, () => ({
      openNewBookingModal: () => {
        if (customer) {
          setShowNewBookingModal(true);
        } else {
          setShowLoginModal(true);
        }
      },
    }));

    const loadBookings = useCallback(
      async (phone: string) => {
        if (!phone) return;
        setIsLoadingBookings(true);
        try {
          const res = await fetch(
            `/api/customer/bookings?slug=${slug}&phone=${encodeURIComponent(phone)}`
          );
          const data = await res.json();
          if (data.success) {
            const sortedBookings = (data.bookings || []).sort(
              (a: CustomerBooking, b: CustomerBooking) => {
                if (a.status === "active" && b.status !== "active") return -1;
                if (a.status !== "active" && b.status === "active") return 1;
                return (
                  new Date(b.booking_date).getTime() -
                  new Date(a.booking_date).getTime()
                );
              }
            );
            setBookings(sortedBookings);
          } else {
            setBookings([]);
          }
        } catch (error) {
          setBookings([]);
        } finally {
          setIsLoadingBookings(false);
        }
      },
      [slug]
    );

    useEffect(() => {
      const savedCustomer = localStorage.getItem(`customer_${slug}`);
      if (savedCustomer) {
        try {
          const parsed = JSON.parse(savedCustomer);
          setCustomer(parsed);
          lastCustomerPhone.current = parsed.phone;
        } catch (e) {
          console.error(e);
        }
      }
    }, [slug]);

    useEffect(() => {
      if (customer && customer.phone && customer.phone !== lastCustomerPhone.current) {
        lastCustomerPhone.current = customer.phone;
        hasLoadedBookings.current = false;
      }
      if (customer && customer.phone && !hasLoadedBookings.current) {
        hasLoadedBookings.current = true;
        loadBookings(customer.phone);
      }
    }, [customer, loadBookings]);

    const handleLogin = (name: string, phone: string, token: string) => {
      const customerData = { id: Date.now(), name, phone, slug };
      setCustomer(customerData);
      lastCustomerPhone.current = phone;
      hasLoadedBookings.current = false;
      localStorage.setItem(`customer_${slug}`, JSON.stringify(customerData));
      setShowLoginModal(false);
      setShowNewBookingModal(true);
    };

    const handleLogout = () => {
      setCustomer(null);
      setBookings([]);
      hasLoadedBookings.current = false;
      lastCustomerPhone.current = "";
      localStorage.removeItem(`customer_${slug}`);
      toast.success("خارج شدید");
    };

    const handleBookingSuccess = () => {
      if (customer) {
        hasLoadedBookings.current = false;
        loadBookings(customer.phone);
      }
    };

    const filteredBookings = bookings.filter((booking) =>
      filterStatus === "all" ? true : booking.status === filterStatus
    );

    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      active: bookings.filter((b) => b.status === "active").length,
    };

    if (!customer) {
      return (
        <div className="mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLoginModal(true)}
            className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
          >
            <LogIn className="w-5 h-5" />
            ورود / ثبت‌نام برای ثبت نوبت
          </motion.button>

          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLogin={handleLogin}
            slug={slug}
          />
        </div>
      );
    }

    return (
      <div className="mt-4 space-y-4">
        <WelcomeCard customer={customer} onLogout={handleLogout} />
        <CustomerStatsCards stats={stats} />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewBookingModal(true)}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          ثبت نوبت جدید
        </motion.button>

        {bookings.length > 0 && (
          <FilterTabs currentFilter={filterStatus} onFilterChange={setFilterStatus} />
        )}

        <BookingsList
          isLoading={isLoadingBookings}
          bookings={filteredBookings}
          filterStatus={filterStatus}
          slug={slug}
          onRefresh={() => loadBookings(customer.phone)}
          onFilterChange={setFilterStatus}
          onNewBooking={() => setShowNewBookingModal(true)}
        />

        <NewBookingModal
          isOpen={showNewBookingModal}
          onClose={() => setShowNewBookingModal(false)}
          business={business}
          slug={slug}
          customerPhone={customer.phone}
          customerName={customer.name}
          onSuccess={handleBookingSuccess}
        />
      </div>
    );
  }
);

CustomerPanel.displayName = "CustomerPanel";

export default CustomerPanel;