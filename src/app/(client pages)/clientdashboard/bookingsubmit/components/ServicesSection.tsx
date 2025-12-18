import React from "react";
import { Scissors, X } from "lucide-react";
import { Service } from "../types";

interface ServicesSectionProps {
  selectedServices: Service[];
  onOpenServicesModal: () => void;
  onRemoveService: (serviceId: number) => void;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({
  selectedServices,
  onOpenServicesModal,
  onRemoveService,
}) => {
  return (
    <div>
      {selectedServices.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedServices.map((service) => (
            <span
              key={service.id}
              className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-sm font-medium border border-emerald-500/30"
            >
              <Scissors className="w-4 h-4" />
              {service.name}
              <button
                onClick={() => onRemoveService(service.id)}
                className="hover:bg-white/20 rounded-full p-1 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onOpenServicesModal}
        className="w-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl py-5 font-bold text-white shadow-2xl hover:shadow-emerald-500/50 active:scale-[0.98] transition-all duration-200 border border-emerald-500/30 flex items-center justify-center gap-4"
      >
        <Scissors className="w-8 h-8" />
        انتخاب خدمات
        {selectedServices.length > 0 && (
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {selectedServices.length} مورد
          </span>
        )}
      </button>
    </div>
  );
};

export default ServicesSection;