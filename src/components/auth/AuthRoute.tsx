
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
          <p className="text-yorpro-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If we have children, render them, otherwise render the Outlet
  return children ? <>{children}</> : <Outlet />;
}
