
import React, { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL from location state or default to /calendar
  const from = (location.state as any)?.from?.pathname || '/calendar';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yorpro-600 mb-4"></div>
          <p className="text-yorpro-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yorpro-700 mb-2">YorPro Calendar</h1>
          <p className="text-gray-600">Manage your legal calendar efficiently</p>
        </div>
        
        <AuthForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Test the application with email: test@example.com and password: password123</p>
          <p className="mt-1">Or create your own account to get started!</p>
        </div>
      </div>
    </div>
  );
}
