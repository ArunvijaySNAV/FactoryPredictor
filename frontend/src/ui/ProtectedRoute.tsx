import type { UserRole } from "@machine-health/shared";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getStoredUser } from "../auth/session";

export function ProtectedRoute({
  role,
  children
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const storedUser = getStoredUser();
  const storedRole = storedUser?.role ?? null;

  if (!storedRole) {
    return <Navigate to="/login" replace />;
  }

  if (storedRole !== role) {
    return <Navigate to={`/${storedRole}`} replace />;
  }

  return <>{children}</>;
}
