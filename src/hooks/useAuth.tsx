
import { createContext, useState, useContext, useEffect } from 'react';
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Only set loading to false after the initial auth state is processed
          if (initialized) {
            setLoading(false);
          }
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('Checking initial session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('Initial session check:', data.session?.user?.email || 'No session');
        
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error during auth initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('Cleaning up auth listener');
      isMounted = false;
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
    initialized 
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
