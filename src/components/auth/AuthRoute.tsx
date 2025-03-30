
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const { session, user, loading } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);
  const [waitingTooLong, setWaitingTooLong] = useState(false);
  const [bypassOption, setBypassOption] = useState(false);

  useEffect(() => {
    // Clear timeouts when authentication state changes
    if (!loading) {
      setShowTimeout(false);
      setWaitingTooLong(false);
      setBypassOption(false);
    }

    if (!loading && !session) {
      console.log('User not authenticated, redirecting to /auth');
    }
    
    // If loading takes too long, show a more helpful message
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth loading timeout reached (5s)');
        setShowTimeout(true);
      }
    }, 5000); // 5 second timeout

    // If waiting even longer, might be a deadlock
    const longTimeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth loading extended timeout reached (15s)');
        setWaitingTooLong(true);
      }
    }, 15000); // 15 second timeout for more serious issue
    
    // After even longer, offer bypass option for development
    const bypassTimeoutId = setTimeout(() => {
      if (loading) {
        console.log('Auth loading critical timeout reached (30s), showing bypass option');
        setBypassOption(true);
      }
    }, 30000); // 30 second timeout

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(longTimeoutId);
      clearTimeout(bypassTimeoutId);
    };
  }, [session, loading]);

  // Debug log for troubleshooting
  console.log('AuthRoute state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading, 
    showTimeout,
    waitingTooLong,
    bypassOption,
    pathname: location.pathname 
  });

  // If bypass option is shown and user wants to continue anyway
  if (loading && bypassOption) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
        <p className="text-gray-700 font-medium text-lg mb-2">Authentication is taking longer than expected</p>
        <p className="text-sm text-gray-600 mb-4 max-w-md text-center">
          This may indicate an issue with the authentication system or network connectivity.
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <a href="/auth" className="text-yorpro-600 hover:underline font-medium px-4 py-2 border border-yorpro-600 rounded-md text-center">
            Go to login page
          </a>
          <a href="/?bypass=true" className="bg-yorpro-600 text-white px-4 py-2 rounded-md hover:bg-yorpro-700 transition-colors text-center">
            Bypass auth (development only)
          </a>
        </div>
      </div>
    );
  }

  // If waiting too long, we might be in a deadlock - show additional information
  if (loading && waitingTooLong) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
        <p className="text-gray-700 font-medium text-lg mb-2">Authentication is taking longer than expected</p>
        <p className="text-sm text-gray-600 mb-4 max-w-md text-center">
          This may indicate an issue with the authentication system or network connectivity.
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <a href="/auth" className="text-yorpro-600 hover:underline font-medium px-4 py-2 border border-yorpro-600 rounded-md text-center">
            Go to login page
          </a>
          <button onClick={() => window.location.reload()} className="bg-yorpro-600 text-white px-4 py-2 rounded-md hover:bg-yorpro-700 transition-colors">
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  // If still loading but timeout reached
  if (loading && showTimeout) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
        <p className="text-gray-700">Still loading authentication...</p>
        <p className="text-sm text-gray-500 mb-2">This may be due to a network issue.</p>
        <div className="flex space-x-4">
          <a href="/auth" className="text-yorpro-600 hover:underline">
            Go to login page
          </a>
        </div>
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
