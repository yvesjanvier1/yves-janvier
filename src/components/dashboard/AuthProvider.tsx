import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { sanitizeError, secureLog, SESSION_TIMEOUT, isSessionExpired } from "@/lib/security";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string, redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  lastActivity: number;
  updateActivity: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const navigate = useNavigate();

  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        const errorMessage = sanitizeError(error);
        toast.error(errorMessage);
        secureLog.error('Sign out failed', error);
        throw error;
      }
      
      secureLog.info('User signed out successfully');
      toast.success("Signed out successfully");
      
      // Navigate to login page
      navigate("/dashboard/login");
    } catch (error) {
      const errorMessage = sanitizeError(error);
      toast.error(errorMessage);
      secureLog.error('Sign out error', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        secureLog.info('Auth state changed', { event, hasSession: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
        
        if (session?.user) {
          updateActivity();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      secureLog.info('Initial session check', { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setIsLoading(false);
      
      if (session?.user) {
        updateActivity();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (isSessionExpired(lastActivity)) {
        secureLog.warn('Session expired due to inactivity');
        signOut();
        toast.error("Session expired due to inactivity");
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, signOut]);

  // Update activity on user interactions
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => updateActivity();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated]);

  const signIn = async (email: string, password: string, redirectPath: string = "/dashboard") => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = sanitizeError(error);
        toast.error(errorMessage);
        secureLog.error('Sign in failed', error);
        throw error;
      }
      
      secureLog.info('User signed in successfully');
      toast.success("Signed in successfully");
      updateActivity();
      
      // Navigate to the intended destination
      navigate(redirectPath);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    lastActivity,
    updateActivity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};