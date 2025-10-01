import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { sanitizeError, secureLog, isSessionExpired } from "@/lib/security";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();

  const updateActivity = () => setLastActivity(Date.now());

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        const errorMessage = sanitizeError(error);
        toast.error(errorMessage);
        secureLog.error("Sign out failed", error);
        return;
      }
      secureLog.info("User signed out successfully");
      toast.success(t("auth.signedOutSuccessfully") || "Signed out successfully");
      // Don’t set isLoading true forever
      setIsAuthenticated(false);
      setUser(null);
      setSession(null);
      navigate("/dashboard/login", { replace: true });
    } catch (error) {
      const errorMessage = sanitizeError(error);
      toast.error(errorMessage);
      secureLog.error("Sign out error", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      secureLog.info("Auth state changed", { event, hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) updateActivity();
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      secureLog.info("Initial session check", { hasSession: !!session });
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) updateActivity();
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (isSessionExpired(lastActivity)) {
        secureLog.warn("Session expired due to inactivity");
        toast.error(t("auth.sessionExpired") || "Session expired due to inactivity");
        signOut();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, signOut, t]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const handleActivity = () => updateActivity();
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach(evt => document.addEventListener(evt, handleActivity, true));
    return () => events.forEach(evt => document.removeEventListener(evt, handleActivity, true));
  }, [isAuthenticated]);

  const signIn = async (email: string, password: string, redirectPath: string = "/dashboard") => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const errorMessage = sanitizeError(error);
        toast.error(errorMessage);
        secureLog.error("Sign in failed", error);
        return;
      }
      secureLog.info("User signed in successfully");
      toast.success(t("auth.signedInSuccessfully") || "Signed in successfully");
      updateActivity();
      navigate(redirectPath, { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated,
      signIn,
      signOut,
      lastActivity,
      updateActivity,
    }),
    [user, session, isLoading, isAuthenticated, lastActivity, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
