import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PinAuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => boolean;
  logout: () => void;
}

const PinAuthContext = createContext<PinAuthContextType | undefined>(undefined);

const CORRECT_PIN = "70985357";
const AUTH_STORAGE_KEY = "calendar_pin_auth";

export function PinAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (pin: string) => {
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <PinAuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
