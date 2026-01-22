import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { ProfileForm } from "./profile-form";
import { User, Bell, Shield, Palette, LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NotificationList } from "@/components/dashboard/notification-list";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const awaitedSearchParams = await searchParams;
  const currentTab =
    typeof awaitedSearchParams.tab === "string"
      ? awaitedSearchParams.tab
      : "profile";

  const menuItems = [
    { name: "Profile", icon: User, id: "profile" },
    { name: "Notifications", icon: Bell, id: "notifications" },
    { name: "Security", icon: Shield, id: "security" },
    { name: "Appearance", icon: Palette, id: "appearance" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <nav className="space-y-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {menuItems.map((item) => (
              <Link
                href={`/dashboard/settings?tab=${item.id}`}
                key={item.name}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  currentTab === item.id
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
              </Link>
            ))}
            <button className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors text-red-500 hover:bg-red-50">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                Sign Out
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-9">
          {currentTab === "profile" && (
            <ProfileForm
              user={{
                name: user.name,
                email: user.email,
                image: user.image,
                phone: user.phone || null,
              }}
            />
          )}
          {currentTab === "notifications" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    View and manage your recent alerts.
                  </p>
                </div>
              </div>
              <NotificationList />
            </div>
          )}
          {currentTab === "security" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center text-gray-500">
              Security settings coming soon...
            </div>
          )}
          {currentTab === "appearance" && (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center text-gray-500">
              Appearance settings coming soon...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
