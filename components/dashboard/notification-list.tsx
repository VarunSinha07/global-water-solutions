"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  getUserNotifications,
  markNotificationAsRead,
  seedDemoNotifications,
  Notification,
} from "@/app/dashboard/notifications/actions";
import { Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationListProps {
  embedded?: boolean;
}

export function NotificationList({ embedded = false }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      // Seed if empty for demo purposes
      await seedDemoNotifications();
      const data = await getUserNotifications();
      setNotifications(data);
      setLoading(false);
    }
    fetch();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-gray-50 p-3 mb-3">
          <Bell className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">No notifications</p>
        <p className="text-xs text-gray-500 mt-1">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "divide-y divide-gray-100",
        embedded ? "max-h-[400px] overflow-y-auto" : "",
      )}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "p-4 hover:bg-gray-50 transition-colors flex gap-3 relative group",
            !notification.isRead && "bg-indigo-50/30",
          )}
        >
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-semibold text-gray-900 uppercase">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {notification.message}
            </p>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          {!notification.isRead && (
            <button
              onClick={() => handleMarkRead(notification.id)}
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 transition-all bg-white rounded-full shadow-sm border border-gray-100"
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </button>
          )}
          {!notification.isRead && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-600 opacity-100 group-hover:opacity-0 transition-opacity" />
          )}
        </div>
      ))}
    </div>
  );
}
