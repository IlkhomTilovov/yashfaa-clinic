import { useState, useEffect, useCallback, useRef } from "react";
import { login, logout, getCurrentUser } from "@/lib/auth-server-functions";
import { checkIsAdmin } from "@/lib/check-admin";
import { getStoredToken, setStoredToken } from "@/lib/auth/client-token";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAdmin: false,
    loading: true,
  });
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!getStoredToken()) {
      if (requestId === requestIdRef.current) {
        setState({ user: null, isAdmin: false, loading: false });
      }
      return;
    }

    try {
      const user = await getCurrentUser();
      if (requestId !== requestIdRef.current) return;

      if (!user) {
        setState({ user: null, isAdmin: false, loading: false });
        return;
      }

      let isAdmin = false;
      try {
        isAdmin = await checkIsAdmin();
      } catch (error) {
        console.error("Failed to resolve admin role", error);
      }

      if (requestId !== requestIdRef.current) return;
      setState({ user, isAdmin, loading: false });
    } catch (error) {
      console.error("Failed to resolve session", error);
      if (requestId === requestIdRef.current) {
        setState({ user: null, isAdmin: false, loading: false });
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await login({ data: { email, password } });
      if (!result.success) {
        throw new Error("Email yoki parol noto'g'ri");
      }
      setStoredToken(result.token);
      await refresh();
    },
    [refresh]
  );

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setStoredToken(null);
      setState({ user: null, isAdmin: false, loading: false });
    }
  }, []);

  return { ...state, signIn, signOut };
}
