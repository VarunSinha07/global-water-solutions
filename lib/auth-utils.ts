import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Validates the current session and checks if the user has the "admin" role.
 * Throws an error if unauthorized. Returns the validated user session.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized: No session active");
  }

  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}
