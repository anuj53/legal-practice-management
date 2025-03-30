
import { createContext, useState, useContext, useEffect, useRef } from 'react';
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

  useEffect(() => {
    console.log('Setting up auth state listener and checking initial session');
    
    // Set isMounted to true when the component mounts
    isMounted.current = true;
    
    // Initial session check - run this first
    const initializeAuth = async () => {
      try {
        if (!isMounted.current) return;
        
        console.log('Checking initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (isMounted.current) {
            setLoading(false);
          }
          return;
        }
        
        console.log('Initial session check:', data.session?.user?.email || 'No session');
        
        if (isMounted.current) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setLoading(false);
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    // Start the initialization process
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        if (!isMounted.current) return;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Only update loading state after initialization
        if (isInitialized.current) {
          setLoading(false);
        }
      }
    );

    // Cleanup function
    return () => {
      console.log('Cleaning up auth listener');
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      // Call Supabase signOut to clear the session on the server
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Manually clear the session and user state
      setSession(null);
      setUser(null);
      console.log('Signed out successfully - state cleared');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error; // Re-throw to let caller handle
    } finally {
      setLoading(false);
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
    isInitialized: isInitialized.current 
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
