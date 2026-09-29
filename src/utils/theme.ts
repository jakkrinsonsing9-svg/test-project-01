/**
 * Theme & CSS Variables Manager for DormTalk (หอคุย)
 * Dynamically updates application CSS variables on :root for accessible Dark Mode
 */

export interface ThemeVariables {
  '--color-background': string;
  '--color-surface': string;
  '--color-surface-card': string;
  '--color-surface-container-lowest': string;
  '--color-surface-container-low': string;
  '--color-surface-container': string;
  '--color-surface-container-high': string;
  '--color-on-surface': string;
  '--color-on-surface-variant': string;
  '--color-outline': string;
  '--color-outline-variant': string;
  '--color-border': string;
  '--color-border-subtle': string;
  '--color-card-bg': string;
  '--color-header-bg': string;
  '--color-pill-bg': string;
  '--color-pill-text': string;
  '--color-pill-border': string;
  '--color-chat-input-bg': string;
}

export const LIGHT_THEME_VARIABLES: ThemeVariables = {
  '--color-background': '#f9f9ff',
  '--color-surface': '#ffffff',
  '--color-surface-card': '#ffffff',
  '--color-surface-container-lowest': '#ffffff',
  '--color-surface-container-low': '#f0f3ff',
  '--color-surface-container': '#e7eeff',
  '--color-surface-container-high': '#dee8ff',
  '--color-on-surface': '#111c2d',
  '--color-on-surface-variant': '#5a5e69',
  '--color-outline': '#767586',
  '--color-outline-variant': '#dee8ff',
  '--color-border': '#e7eeff',
  '--color-border-subtle': '#dee8ff',
  '--color-card-bg': '#ffffff',
  '--color-header-bg': 'rgba(255, 255, 255, 0.9)',
  '--color-pill-bg': '#f0f3ff',
  '--color-pill-text': '#464554',
  '--color-pill-border': '#dee8ff',
  '--color-chat-input-bg': '#f0f3ff',
};

export const DARK_THEME_VARIABLES: ThemeVariables = {
  '--color-background': '#0f141c',
  '--color-surface': '#171f2c',
  '--color-surface-card': '#171f2c',
  '--color-surface-container-lowest': '#121721',
  '--color-surface-container-low': '#1e2736',
  '--color-surface-container': '#263346',
  '--color-surface-container-high': '#2f3e55',
  '--color-on-surface': '#f3f4f6',
  '--color-on-surface-variant': '#94a3b8',
  '--color-outline': '#64748b',
  '--color-outline-variant': '#263346',
  '--color-border': '#293548',
  '--color-border-subtle': '#202937',
  '--color-card-bg': '#171f2c',
  '--color-header-bg': 'rgba(23, 31, 44, 0.92)',
  '--color-pill-bg': '#1e2736',
  '--color-pill-text': '#cbd5e1',
  '--color-pill-border': '#2f3e55',
  '--color-chat-input-bg': '#1e2736',
};

export const STORAGE_KEY = 'dormtalk_theme_mode';

/**
 * Updates application CSS variables directly on document.documentElement
 * ensuring immediate synchronization with stylesheets and inline style bindings
 */
export function applyThemeVariables(isDark: boolean): ThemeVariables {
  const root = document.documentElement;
  const variables = isDark ? DARK_THEME_VARIABLES : LIGHT_THEME_VARIABLES;

  // Explicitly update all CSS variables on :root (document.documentElement)
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  if (isDark) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }

  try {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
  } catch {
    // ignore local storage restrictions in sandboxes
  }

  return variables;
}

/**
 * Returns initial dark mode setting based on saved preferences or system preferences
 */
export function getInitialDarkMode(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    // ignore
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}
