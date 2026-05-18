import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { User } from "@/types";

export const ProtectedRoute = ({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: User["role"][];
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

