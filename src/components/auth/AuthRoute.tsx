
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  // Add timeout state to handle potential auth hanging
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      console.log('User not authenticated, redirecting to /auth');
    }
    
    // If loading takes too long, show a more helpful message
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout reached');
        setShowTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
  }, [session, loading]);

  // If still loading but timeout reached
  if (loading && showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
        <p className="text-gray-700">Still loading authentication...</p>
        <a href="/auth" className="text-yorpro-600 hover:underline mt-2">
          Click here to go to login page
        </a>
      </div>
    );
  }

  // Normal loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
