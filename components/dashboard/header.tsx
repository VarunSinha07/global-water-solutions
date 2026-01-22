"use client";

import { Search } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import Image from "next/image";

export function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 px-6 shadow-sm backdrop-blur-xl transition-all">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <div className="relative w-full max-w-md my-auto group">
            <Search
              className="pointer-events-none absolute inset-y-0 left-3 h-full w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors"
              aria-hidden="true"
            />
            <input
              id="search-field"
              className="block h-10 w-full rounded-xl border border-gray-200/60 bg-gray-50/50 py-2 pl-10 pr-12 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:text-sm transition-all shadow-sm focus:shadow-md"
              placeholder="Search everything..."
              type="search"
              name="search"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50">
                ⌘K
              </span>
            </div>
          </div>
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationDropdown />

          <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user.name}
                </p>
                <p className="text-xs text-gray-500">{session?.user.email}</p>
              </div>
              <div className="h-9 w-9 overflow-hidden rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm relative">
                {session?.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="object-cover"
                    fill
                    sizes="36px"
                  />
                ) : (
                  session?.user.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
