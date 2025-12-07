import React from "react";
import ServiceControlPanel from "./components/ServiceControlPanel/ServiceControlPanel";
import RecentAppointmentsList from "./components/RecentAppointmentsList/RecentAppointmentsList";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

export default function page() {
  return (
    <div className="h-screen text-white overflow-auto max-w-md m-auto">
      <div className="h-[90%] overflow-hidden bg-[#2f3442]">
        <Header />
        <ServiceControlPanel />
        <RecentAppointmentsList />
      </div>
      <Footer />
    </div>
  );
}
