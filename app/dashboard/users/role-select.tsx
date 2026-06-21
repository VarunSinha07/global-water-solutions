"use client";

import { updateUserRole } from "./actions";
import { useTransition } from "react";
import { toast } from "sonner";

interface RoleSelectProps {
  userId: string;
  currentRole: string;
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as "admin" | "user";
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Role updated to ${role} successfully`);
      }
    });
  };

  return (
    <select
      name="role"
      value={currentRole || "user"}
      disabled={isPending}
      onChange={handleChange}
      className="block rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 px-3 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
