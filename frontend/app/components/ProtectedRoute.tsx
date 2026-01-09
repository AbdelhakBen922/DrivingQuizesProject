import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import type { UserType } from "~/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes: UserType[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component that guards routes based on user authentication and type
 * @param children - The content to render if access is allowed
 * @param allowedUserTypes - Array of user types that can access this route
 * @param redirectTo - Optional custom redirect path (defaults based on user type)
 */
export function ProtectedRoute({ 
  children, 
  allowedUserTypes, 
  redirectTo 
}: ProtectedRouteProps) {
  const { user, userType, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // Check if user is authenticated
    if (!user || !userType) {
      // Not logged in -> redirect to landing page
      navigate(redirectTo || "/", { replace: true });
      return;
    }

    // Check if user type is allowed
    if (!allowedUserTypes.includes(userType)) {
      // User is logged in but doesn't have permission
      // Redirect based on their actual user type
      if (userType === "staff") {
        navigate(redirectTo || "/dashboard", { replace: true });
      } else if (userType === "student" || userType === "guest") {
        navigate(redirectTo || "/student/dashboard", { replace: true });
      } else {
        navigate(redirectTo || "/", { replace: true });
      }
    }
  }, [user, userType, isLoading, allowedUserTypes, navigate, redirectTo]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If user is not allowed, don't render anything (redirect will happen)
  if (!user || !userType || !allowedUserTypes.includes(userType)) {
    return null;
  }

  // User is authenticated and has correct type
  return <>{children}</>;
}

/**
 * PublicRoute component for pages that should only be accessible to non-authenticated users
 * (like login, signup, landing page)
 */
export function PublicRoute({ 
  children, 
  redirectAuthenticated = true 
}: { 
  children: React.ReactNode; 
  redirectAuthenticated?: boolean;
}) {
  const { user, userType, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    // If user is authenticated and we should redirect them
    if (redirectAuthenticated && user && userType && userType !== null) {
      // Redirect based on user type
      if (userType === "staff") {
        navigate("/dashboard", { replace: true });
      } else if (userType === "student" || userType === "guest") {
        navigate("/student/dashboard", { replace: true });
      }
    }
  }, [user, userType, isLoading, redirectAuthenticated, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If user is authenticated and should be redirected, don't render content
  if (redirectAuthenticated && user && userType && userType !== null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Redirecting...</div>
      </div>
    );
  }

  // Render the page
  return <>{children}</>;
}
