"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationList } from "@/components/dashboard/notification-list";
import {
  getUserNotifications,
  markAllNotificationsAsRead
} from "@/app/dashboard/notifications/actions";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch to get count
    getUserNotifications().then((data) => {
      setUnreadCount(data.filter((n) => !n.isRead).length);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 transition-colors focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <div className="relative">
          <Bell className="h-6 w-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Mark all as read
              </button>
            )}
          </div>
          <NotificationList embedded={true} />
        </div>
      )}
    </div>
  );
}
