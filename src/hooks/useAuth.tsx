import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const resolveAuthState = async (session: Session | null) => {
      const requestId = ++requestIdRef.current;
      const user = session?.user ?? null;
      let isAdmin = false;

      if (user) {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (error) {
          console.error("Failed to resolve admin role", error);
        } else {
          isAdmin = !!data;
        }
      }

      if (!isMounted || requestId !== requestIdRef.current) {
        return;
      }

      setState({ user, session, isAdmin, loading: false });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolveAuthState(session);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => resolveAuthState(session))
      .catch(() => {
        if (isMounted) {
          setState({ user: null, session: null, isAdmin: false, loading: false });
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return { ...state, signIn, signOut };
}
