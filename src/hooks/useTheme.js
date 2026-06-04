import { useState, useEffect, useCallback } from 'react';

// Должны совпадать с --bg-app в tokens.css
const BG_COLORS = {
  light: '#F2F2F7',
  dark:  '#000000',
};

// Дефолтные акценты для каждой темы
const DEFAULT_ACCENTS = {
  light: '#FF375F', // Apple systemPink
  dark:  '#FF375F',
};

const STORAGE_KEYS = {
  theme:       'myau_theme',
  accentLight: 'myau_accent_light',
  accentDark:  'myau_accent_dark',
};

function loadAccents() {
  return {
    light: localStorage.getItem(STORAGE_KEYS.accentLight) ?? DEFAULT_ACCENTS.light,
    dark:  localStorage.getItem(STORAGE_KEYS.accentDark)  ?? DEFAULT_ACCENTS.dark,
  };
}

/** Применяет CSS-переменные акцента на :root */
function applyAccent(hex) {
  const root = document.documentElement;
  // Парсим hex → rgba для muted/glow
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  root.style.setProperty('--accent',       hex);
  root.style.setProperty('--accent-muted', `rgba(${r}, ${g}, ${b}, 0.15)`);
  root.style.setProperty('--accent-glow',  `rgba(${r}, ${g}, ${b}, 0.28)`);
}

export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [accents, setAccentsState] = useState(loadAccents);

  // Применяем тему + правильный акцент
  useEffect(() => {
    const root = document.documentElement;
    const bgColor = BG_COLORS[theme] ?? BG_COLORS.light;

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    // Применяем акцент текущей темы
    applyAccent(accents[theme]);

    // theme-color для Safari / PWA
    const metaMain = document.getElementById('theme-color-main');
    if (metaMain) {
      metaMain.setAttribute('content', bgColor);
    } else {
      const meta = document.createElement('meta');
      meta.name    = 'theme-color';
      meta.id      = 'theme-color-main';
      meta.content = bgColor;
      document.head.appendChild(meta);
    }

    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme, accents]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  /** Меняет акцент только для указанной темы */
  const setAccent = useCallback((forTheme, hex) => {
    const key = forTheme === 'dark' ? STORAGE_KEYS.accentDark : STORAGE_KEYS.accentLight;
    localStorage.setItem(key, hex);
    setAccentsState((prev) => ({ ...prev, [forTheme]: hex }));
  }, []);

  return {
    theme,
    accents,          // { light: '#...', dark: '#...' }
    setTheme,
    toggleTheme,
    setAccent,        // (forTheme: 'light'|'dark', hex: string) => void
  };
};
