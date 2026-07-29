/** @deprecated Use siteThemes — kept for migration only */
export type StoreThemeId = 'noir' | 'editorial' | 'arena';
export { loadSiteTheme as loadStoreTheme, saveSiteTheme as saveStoreTheme } from './siteThemes';
