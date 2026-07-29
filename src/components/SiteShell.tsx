import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteThemeSwitcher from './SiteThemeSwitcher';
import { useSiteTheme } from '../context/SiteThemeContext';

/** Shared themed chrome for all customer-facing routes (not admin). */
export default function SiteShell() {
  const { theme, setTheme, themeFlash, chromeHidden } = useSiteTheme();
  const { pathname } = useLocation();
  const hideSwitcher = pathname.startsWith('/order/');

  return (
    <div
      data-site-theme={theme}
      className="flex min-h-screen flex-col bg-[var(--site-bg)] font-sans text-[var(--site-ink)] selection:bg-[var(--site-gold)]/35"
    >
      {themeFlash && <div className="site-theme-flash" aria-hidden />}
      {!hideSwitcher && (
        <SiteThemeSwitcher
          active={theme}
          onChange={setTheme}
          hidden={chromeHidden}
        />
      )}
      <Outlet />
    </div>
  );
}
