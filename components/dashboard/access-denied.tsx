"use client";

import { LogOut, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function AccessDenied() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-gray-200/60 bg-white p-8 shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Access Denied
        </h1>
        <p className="mb-8 text-gray-500 text-sm leading-relaxed">
          You are not an admin. Please ask the developer to give you the admin
          role to access this dashboard.
        </p>

        <button
          onClick={handleSignOut}
          className="group relative flex w-full items-center justify-center rounded-xl bg-[#2e3458] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1e233d] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2e3458] focus:ring-offset-2"
        >
          <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sign out to switch account
        </button>
      </div>
    </div>
  );
}
