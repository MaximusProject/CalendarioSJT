import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PinAuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
  authState: 'loading' | 'authenticated' | 'unauthenticated';
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

const CORRECT_PIN = "70985357";
const AUTH_STORAGE_KEY = "calendar_pin_auth";

export function PinAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
      setAuthState('authenticated');
    } else {
      setAuthState('unauthenticated');
    }
  }, []);

  const login = (pin: string) => {
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      setAuthState('authenticated');
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      
      // Disparar evento global
      window.dispatchEvent(new CustomEvent('pin-login-success'));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthState('unauthenticated');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pin-logout'));
  };

  return (
    <PinAuthContext.Provider value={{ isAuthenticated, login, logout, authState }}>
      {children}
    </PinAuthContext.Provider>
  );
}

export function usePinAuth() {
  const context = useContext(PinAuthContext);
  if (context === undefined) {
    throw new Error("usePinAuth must be used within a PinAuthProvider");
  }
  return context;
}