import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { auth } from "@/lib/auth"; // Server-side auth check
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { AccessDenied } from "@/components/dashboard/access-denied";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin") {
    return <AccessDenied />;
  }

  return (
    <>
      <DashboardShell>{children}</DashboardShell>
      <Toaster position="top-right" richColors />
    </>
  );
}
