"use client";

import {
  Search,
  Users,
  FileText,
  AlertCircle,
  Loader2,
  X,
  Menu,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { NotificationDropdown } from "@/components/dashboard/notification-dropdown";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResult } from "@/app/dashboard/actions";

interface HeaderProps {
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { data: session } = authClient.useSession();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await globalSearch(query);
        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "Customer":
        return <Users className="h-4 w-4 text-gray-500" />;
      case "AMC":
        return <FileText className="h-4 w-4 text-gray-500" />;
      case "Complaint":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 px-4 sm:px-6 shadow-sm backdrop-blur-xl transition-all">
      {onOpenSidebar && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <div
            className="relative w-full max-w-md my-auto group"
            ref={dropdownRef}
          >
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              ) : query ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setIsOpen(false);
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded-full"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              ) : (
                <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 pointer-events-none">
                  ⌘K
                </span>
              )}
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                <div className="p-2 space-y-1">
                  {results.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result.url)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-8 w-8 min-w-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-colors">
                          {getIcon(result.type)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </span>
                          <span className="text-xs text-gray-500 truncate">
                            {result.subtitle}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium ml-2">
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isOpen &&
              query.length >= 2 &&
              results.length === 0 &&
              !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center z-50">
                  <p className="text-sm text-gray-500">
                    No results found for &quot;{query}&quot;
                  </p>
                </div>
              )}
          </div>
        </div>
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
