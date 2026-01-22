"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { ServiceModal } from "./service-modal";

interface Service {
  id: string;
  serviceType: string;
  installationDate: string | Date;
  customer: {
    name: string;
  };
}

interface ServicesGridProps {
  services: Service[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Wrench className="h-full w-full" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No services found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new service installation.
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-full bg-gray-100 p-3 text-gray-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Wrench className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                  Active
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">
                  {service.serviceType}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Customer:{" "}
                  <span className="font-medium text-gray-700">
                    {service.customer.name}
                  </span>
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500 font-medium">Service ID</span>
                  <span className="font-semibold text-gray-900 font-mono tracking-wide text-right">
                    {service.id.split("-")[0]}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500 font-medium">
                    Installation Date
                  </span>
                  <span className="font-semibold text-gray-900 text-right">
                    {new Date(service.installationDate).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "2-digit", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-0">
                <button
                  onClick={() => setSelectedService(service)}
                  className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  );
}
