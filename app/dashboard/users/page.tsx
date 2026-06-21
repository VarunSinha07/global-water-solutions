import { getUsers } from "./actions";
import { RoleSelect } from "./role-select";
import { Shield, Mail, Calendar, UserCheck } from "lucide-react";
import Image from "next/image";

export default async function UsersPage() {
  const users = await getUsers();

  const avatarColors = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ];

  return (
    <div
      className="min-h-screen space-y-8 animate-in fade-in duration-500"
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="relative pb-6 border-b border-gray-100">
        <div className="absolute bottom-0 left-0 h-px w-24 bg-indigo-600" />
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 mb-1">
              Security & Permissions
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Manage system permissions and promote users to administrators.
            </p>
          </div>
        </div>
      </div>

      {/* ── Table Card ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-gray-100">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Registered Users
          </span>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
            {users.length} Total
          </span>
        </div>

        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {["User Details", "Role", "Date Registered", "Change Access"].map((h) => (
                  <th
                    key={h}
                    className="h-11 px-6 align-middle text-[11px] font-bold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserCheck className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="text-slate-400 text-sm">
                        No users registered in the system.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const colorClass = avatarColors[i % avatarColors.length];
                  return (
                    <tr
                      key={user.id}
                      className="group transition-colors duration-150 hover:bg-slate-50/50"
                    >
                      {/* User Avatar & Name */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm relative">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || "User"}
                                className="object-cover"
                                fill
                                sizes="40px"
                              />
                            ) : (
                              <div className={`h-full w-full flex items-center justify-center text-sm font-bold uppercase ${colorClass}`}>
                                {user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-sm">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Mail className="h-3 w-3 shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="px-6 py-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            user.role === "admin"
                              ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                              : "bg-slate-100 text-slate-600 ring-slate-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.role === "admin" ? "bg-indigo-600" : "bg-slate-500"
                            }`}
                          />
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      {/* Created At Date */}
                      <td className="px-6 py-4 align-middle">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>
                            {new Date(user.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Change Role Input */}
                      <td className="px-6 py-4 align-middle">
                        <RoleSelect userId={user.id} currentRole={user.role || "user"} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
