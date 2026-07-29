import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  loadSiteTheme,
  saveSiteTheme,
  SiteThemeId,
} from '../theme/siteThemes';

type SiteThemeContextValue = {
  theme: SiteThemeId;
  setTheme: (id: SiteThemeId) => void;
  themeFlash: boolean;
  /** Hide theme FAB while modal / cart / checkout are open */
  chromeHidden: boolean;
  setChromeHidden: (v: boolean) => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteThemeId>(() => loadSiteTheme());
  const [themeFlash, setThemeFlash] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);

  const setTheme = (id: SiteThemeId) => {
    setThemeState(id);
    saveSiteTheme(id);
    setThemeFlash(true);
    window.setTimeout(() => setThemeFlash(false), 700);
  };

  useEffect(() => {
    document.documentElement.dataset.siteTheme = theme;
  }, [theme]);

  return (
    <SiteThemeContext.Provider
      value={{ theme, setTheme, themeFlash, chromeHidden, setChromeHidden }}
    >
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error('useSiteTheme must be used within SiteThemeProvider');
  }
  return ctx;
}
