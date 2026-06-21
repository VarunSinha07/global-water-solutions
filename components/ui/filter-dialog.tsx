"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, Filter } from "lucide-react";

export type FilterType = "radio" | "checkbox" | "date-range" | "range" | "text";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterCategory {
  id: string; // url param key (e.g., 'sort', 'status')
  label: string;
  type: FilterType;
  options?: FilterOption[]; // for radio/checkbox
  placeholder?: string; // for text inputs
}

interface FilterDialogProps {
  filters: FilterCategory[];
}

export function FilterDialog({ filters }: FilterDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    filters[0]?.id || "",
  );

  // Helper function to initialize filters from URL params
  const getFiltersFromParams = () => {
    const currentFilters: Record<string, string | string[]> = {};
    filters.forEach((filter) => {
      const value = searchParams.get(filter.id);
      if (value) {
        if (filter.type === "checkbox") {
          currentFilters[filter.id] = value.split(",");
        } else {
          currentFilters[filter.id] = value;
        }
      }
    });

    // Also check specific start/end date params if they exist for date-range types
    filters.forEach((filter) => {
      if (filter.type === "date-range") {
        const start = searchParams.get(`${filter.id}Start`);
        const end = searchParams.get(`${filter.id}End`);
        if (start) currentFilters[`${filter.id}Start`] = start;
        if (end) currentFilters[`${filter.id}End`] = end;
      }
      if (filter.type === "range") {
        const min = searchParams.get(`${filter.id}Min`);
        const max = searchParams.get(`${filter.id}Max`);
        if (min) currentFilters[`${filter.id}Min`] = min;
        if (max) currentFilters[`${filter.id}Max`] = max;
      }
    });
    return currentFilters;
  };

  // Local state for filters before applying
  const [localFilters, setLocalFilters] = useState<
    Record<string, string | string[]>
  >(() => (isOpen ? getFiltersFromParams() : {}));

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Clear existing known filter keys to ensure we overwrite/remove empty ones
    filters.forEach((f) => {
      params.delete(f.id);
      if (f.type === "date-range") {
        params.delete(`${f.id}Start`);
        params.delete(`${f.id}End`);
      }
      if (f.type === "range") {
        params.delete(`${f.id}Min`);
        params.delete(`${f.id}Max`);
      }
    });

    Object.entries(localFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (typeof value === "string" && value) {
        params.set(key, value);
      }
    });

    // Reset pagination if filters change (optional but recommended)
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setLocalFilters({});
  };

  const updateFilter = (key: string, value: string | string[]) => {
    setLocalFilters((prev) => {
      const next = { ...prev };
      if (!value || (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const activeFilterCount = Object.keys(localFilters).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Filter className="mr-2 h-4 w-4 text-gray-500" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs">
            {activeFilterCount}
          </span>
        )}
      </button>
    );
  }

  // Find currently selected category config
  const currentCategoryConfig =
    filters.find((f) => f.id === selectedCategory) || filters[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-indigo-600" />
            Filter & Sort
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar (Tabs) */}
          <div className="w-full md:w-1/3 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto shrink-0">
            <div className="p-2 flex md:flex-col overflow-x-auto md:overflow-x-visible gap-1.5 md:space-y-1 no-scrollbar">
              {filters.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-auto md:w-full text-left px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-colors flex justify-between items-center gap-4 shrink-0 whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-white text-indigo-600 shadow-sm border border-gray-100"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {category.label}
                  {(localFilters[category.id] ||
                    localFilters[`${category.id}Start`] ||
                    localFilters[`${category.id}Min`]) && (
                    <div className="h-2 w-2 rounded-full bg-indigo-600 shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white">
            <div className="space-y-6">
              <h4 className="font-medium text-lg text-gray-900 mb-4">
                {currentCategoryConfig.label}
              </h4>

              {/* Radio Options (Single Select) */}
              {currentCategoryConfig.type === "radio" && (
                <div className="space-y-3">
                  {currentCategoryConfig.options?.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer group transition-all"
                    >
                      <input
                        type="radio"
                        name={currentCategoryConfig.id}
                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                        checked={
                          localFilters[currentCategoryConfig.id] ===
                          option.value
                        }
                        onChange={() =>
                          updateFilter(currentCategoryConfig.id, option.value)
                        }
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox Options (Multi Select) */}
              {currentCategoryConfig.type === "checkbox" && (
                <div className="space-y-3">
                  {currentCategoryConfig.options?.map((option) => {
                    const currentValues =
                      (localFilters[currentCategoryConfig.id] as string[]) ||
                      [];
                    const isChecked = currentValues.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilter(currentCategoryConfig.id, [
                                ...currentValues,
                                option.value,
                              ]);
                            } else {
                              updateFilter(
                                currentCategoryConfig.id,
                                currentValues.filter((v) => v !== option.value),
                              );
                            }
                          }}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Date Range */}
              {currentCategoryConfig.type === "date-range" && (
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                      value={
                        (localFilters[
                          `${currentCategoryConfig.id}Start`
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateFilter(
                          `${currentCategoryConfig.id}Start`,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                      value={
                        (localFilters[
                          `${currentCategoryConfig.id}End`
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateFilter(
                          `${currentCategoryConfig.id}End`,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              )}

              {/* Number Range */}
              {currentCategoryConfig.type === "range" && (
                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                      value={
                        (localFilters[
                          `${currentCategoryConfig.id}Min`
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateFilter(
                          `${currentCategoryConfig.id}Min`,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Any"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                      value={
                        (localFilters[
                          `${currentCategoryConfig.id}Max`
                        ] as string) || ""
                      }
                      onChange={(e) =>
                        updateFilter(
                          `${currentCategoryConfig.id}Max`,
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              )}

              {/* Text Input */}
              {currentCategoryConfig.type === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search / Filter
                  </label>
                  <input
                    type="text"
                    placeholder={
                      currentCategoryConfig.placeholder || "Enter value..."
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2.5 px-3 border"
                    value={
                      (localFilters[currentCategoryConfig.id] as string) || ""
                    }
                    onChange={(e) =>
                      updateFilter(currentCategoryConfig.id, e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleClearAll}
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Clear all filters
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
