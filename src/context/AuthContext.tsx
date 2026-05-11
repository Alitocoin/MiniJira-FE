import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthUser {
  userId: number;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, userId: number, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredAuth(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  if (token && userId && username) {
    return {
      token,
      user: { userId: Number(userId), username },
    };
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredAuth();
  const [token, setToken] = useState<string | null>(stored.token);
  const [user, setUser] = useState<AuthUser | null>(stored.user);
  const navigate = useNavigate();

  const login = useCallback((newToken: string, userId: number, username: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', String(userId));
    localStorage.setItem('username', username);
    setToken(newToken);
    setUser({ userId, username });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
