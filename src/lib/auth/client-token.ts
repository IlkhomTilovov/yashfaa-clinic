// Where the browser keeps its admin session token (replaces Supabase's own
// localStorage-based session storage).
const STORAGE_KEY = "yashfaa_admin_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode, etc.) — session just won't persist.
  }
}
