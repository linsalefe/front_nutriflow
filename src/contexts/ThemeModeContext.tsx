import { createContext, useContext, useMemo, useState } from 'react';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  const toggleMode = () => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}
