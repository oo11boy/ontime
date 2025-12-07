import React from "react";
import "./ServiceControlPanel.css";
import PlanStatus from "./Planstatus";
import Buttons from "./Buttons";
import SmsStatus from "./SmsStatus";

export default function ServiceControlPanel() {
  return (
    <div className="w-[95%]! m-auto  ServiceControlPanel shadow-2xl flex justify-start  items-center flex-col">
      <div className="bg-[#1B1F28] rounded-xl  p-4  flex flex-col justify-start items-center shadow-sm w-full mx-auto">
        <SmsStatus />
        <PlanStatus />
        <Buttons />
      </div>
    </div>
  );
}
