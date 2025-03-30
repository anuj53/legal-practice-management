
import { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
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
        
        if (data.session) {
          console.log('Found existing session:', data.session.user?.email);
          safeSetState(data.session, data.session.user, false);
        } else {
          console.log('No active session found');
          safeSetState(null, null, false);
        }
      } catch (err) {
        console.error('Error during session check:', err);
        safeSetState(null, null, false);
      }
    };
    
    // Set up auth state listener before checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (currentSession) {
          safeSetState(currentSession, currentSession.user, false);
        } else {
          safeSetState(null, null, false);
        }
      }
    );
    
    // Check session if not already initialized
    if (!isInitialized.current) {
      isInitialized.current = true;
      checkSession();
    }
    
    // Clean up
    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [safeSetState]);

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      safeSetState(null, null, false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Error signing in:', error);
        return { error };
      }
      
      safeSetState(data.session, data.user, false);
      return { error: null };
    } catch (error) {
      console.error('Exception during sign in:', error);
      setLoading(false);
      return { error };
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        console.error('Error signing up:', error);
        return { error };
      }
      
      // Note: signUp doesn't automatically log the user in if email confirmation is enabled
      if (data.session) {
        safeSetState(data.session, data.user, false);
      } else {
        setLoading(false);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Exception during sign up:', error);
      setLoading(false);
      return { error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signIn,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
