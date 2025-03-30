
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);
  const isMounted = useRef(true);
  const authCheckCompleted = useRef(false);

  // Separate function to safely update state only if component is still mounted
  const safeSetState = useCallback((
    sessionData: Session | null,
    userData: User | null,
    isLoading: boolean
  ) => {
    if (!isMounted.current) return;

    setSession(sessionData);
    setUser(userData);
    setLoading(isLoading);
    
    if (!isLoading && !authCheckCompleted.current) {
      authCheckCompleted.current = true;
      console.log('Auth check completed with user:', userData?.email || 'No user');
    }
  }, []);

  useEffect(() => {
    console.log('Setting up auth provider, initializing auth state');
    
    // Reset mounted state on mount
    isMounted.current = true;
    
    // Function to check the initial session
    const checkSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          safeSetState(null, null, false);
          return;
        }
        
        console.log('Initial session check result:', 
          data.session ? `User: ${data.session.user?.email}` : 'No active session');
        
        safeSetState(data.session, data.session?.user ?? null, false);
        isInitialized.current = true;
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        safeSetState(null, null, false);
      }
    };

    // Set up the auth state change listener before checking session
    console.log('Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email || 'no user');
        
        // Defer state update to avoid potential deadlocks or race conditions
        setTimeout(() => {
          if (!isMounted.current) return;
          safeSetState(newSession, newSession?.user ?? null, false);
        }, 0);
      }
    );

    // Start the session check
    checkSession();

    // Clean up on unmount
    return () => {
      console.log('Cleaning up auth provider');
      isMounted.current = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [safeSetState]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('Sign out successful, clearing state');
      safeSetState(null, null, false);
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut
  };

  console.log('Auth context state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading, 
    isInitialized: isInitialized.current,
    authCheckCompleted: authCheckCompleted.current
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
