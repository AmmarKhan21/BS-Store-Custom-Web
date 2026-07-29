export type SiteThemeId =
  | 'emerald'
  | 'obsidian'
  | 'champagne'
  | 'arctic'
  | 'crimson';

export type SiteThemeMeta = {
  id: SiteThemeId;
  name: string;
  tagline: string;
  mood: string;
  swatches: [string, string, string, string];
};

export const SITE_THEMES: SiteThemeMeta[] = [
  {
    id: 'emerald',
    name: 'Emerald Glory',
    tagline: 'Cinematic forest & championship gold',
    mood: 'Signature',
    swatches: ['#050d0b', '#1f6b55', '#c9a66b', '#f4efe6'],
  },
  {
    id: 'obsidian',
    name: 'Obsidian Royal',
    tagline: 'Deep ink, sapphire flash, bright gold',
    mood: 'Regal',
    swatches: ['#06080f', '#2a4a7a', '#d4af37', '#eef1f7'],
  },
  {
    id: 'champagne',
    name: 'Champagne Atelier',
    tagline: 'Light cream stage, bronze metal, soft sand',
    mood: 'Light',
    swatches: ['#f3ebe0', '#8b6914', '#c4a574', '#1c1712'],
  },
  {
    id: 'arctic',
    name: 'Arctic Steel',
    tagline: 'Cool slate, ice mint, silver light',
    mood: 'Modern',
    swatches: ['#0a1014', '#4a9b8c', '#a8b4c0', '#e8eef2'],
  },
  {
    id: 'crimson',
    name: 'Crimson Arena',
    tagline: 'Night black, victory red, warm gold',
    mood: 'Bold',
    swatches: ['#0c0808', '#9b2c2c', '#d4a84b', '#f5ebe3'],
  },
];

export const DEFAULT_SITE_THEME: SiteThemeId = 'emerald';

const STORAGE_KEY = 'bismillah_site_theme';

export function loadSiteTheme(): SiteThemeId {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as SiteThemeId | null;
    if (v && SITE_THEMES.some((t) => t.id === v)) return v;
    // migrate old store theme keys
    const old = localStorage.getItem('bismillah_store_theme');
    if (old === 'noir') return 'emerald';
    if (old === 'arena') return 'arctic';
    if (old === 'editorial') return 'champagne';
  } catch {
    /* ignore */
  }
  return DEFAULT_SITE_THEME;
}

export function saveSiteTheme(id: SiteThemeId) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

/** Read live --site-bg from the themed root (for canvas fills). */
export function readSiteBg(el?: Element | null): string {
  const node = el ?? document.querySelector('[data-site-theme]');
  if (!node) return '#050d0b';
  const v = getComputedStyle(node).getPropertyValue('--site-bg').trim();
  return v || '#050d0b';
}
