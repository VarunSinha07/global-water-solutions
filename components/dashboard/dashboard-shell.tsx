"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* ── Mobile Sidebar Drawer (AnimatePresence) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeSidebar}
            />

            {/* Sidebar Slide-in */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative flex w-full max-w-[280px] h-full focus:outline-none"
            >
              <Sidebar onClose={closeSidebar} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onOpenSidebar={openSidebar} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
