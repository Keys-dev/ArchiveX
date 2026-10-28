import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, logout, getToken, type ApiUser } from '../lib/api';

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there's a valid token on mount
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Validate token by trying to fetch current user
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        logout();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signOut = () => {
    logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
