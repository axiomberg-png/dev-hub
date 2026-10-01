import { createContext, useContext, ReactNode } from 'react';

interface GlobalPreferences {
  locale: string;
  timezone: string;
  country?: string;
  region?: string;
}

interface GlobalContextType {
  preferences: GlobalPreferences;
  updatePreferences: (prefs: Partial<GlobalPreferences>) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children, defaultPreferences }: { children: ReactNode; defaultPreferences: GlobalPreferences }) {
  const [preferences, setPreferences] = React.useState<GlobalPreferences>(defaultPreferences);

  const updatePreferences = (prefs: Partial<GlobalPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...prefs }));
  };

  return (
    <GlobalContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalPreferences() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalPreferences must be used within GlobalProvider');
  }
  return context;
}
