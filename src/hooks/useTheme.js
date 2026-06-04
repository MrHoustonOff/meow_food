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
  systemTheme: 'myau_system_theme',
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
  const [systemTheme, setSystemThemeState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.systemTheme) === 'true';
  });

  // Запоминаем ручную тему (по умолчанию light или сохранённая)
  const [manualTheme, setManualTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.theme) || 'light';
  });

  // Отслеживаем системные предпочтения
  const [sysPref, setSysPref] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [accents, setAccentsState] = useState(loadAccents);

  // Слушатель системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSysPref(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const activeTheme = systemTheme ? sysPref : manualTheme;

  // Применяем тему + правильный акцент
  useEffect(() => {
    const root = document.documentElement;
    const bgColor = BG_COLORS[activeTheme] ?? BG_COLORS.light;

    root.setAttribute('data-theme', activeTheme);
    root.style.colorScheme = activeTheme;

    // Применяем акцент текущей темы
    applyAccent(accents[activeTheme]);

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

    // Сохраняем ТОЛЬКО ручную тему в localStorage
    localStorage.setItem(STORAGE_KEYS.theme, manualTheme);
  }, [activeTheme, manualTheme, accents]);

  const setTheme = useCallback((newTheme) => {
    if (systemTheme) return; // Блокируем ручное изменение
    setManualTheme(newTheme);
  }, [systemTheme]);

  const toggleTheme = useCallback(() => {
    if (systemTheme) return; // Блокируем ручное изменение
    setManualTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [systemTheme]);

  const setSystemTheme = useCallback((val) => {
    localStorage.setItem(STORAGE_KEYS.systemTheme, val);
    setSystemThemeState(val);
  }, []);

  /** Меняет акцент только для указанной темы */
  const setAccent = useCallback((forTheme, hex) => {
    const key = forTheme === 'dark' ? STORAGE_KEYS.accentDark : STORAGE_KEYS.accentLight;
    localStorage.setItem(key, hex);
    setAccentsState((prev) => ({ ...prev, [forTheme]: hex }));
  }, []);

  return {
    theme: activeTheme,
    accents,          // { light: '#...', dark: '#...' }
    systemTheme,
    setTheme,
    toggleTheme,
    setSystemTheme,
    setAccent,        // (forTheme: 'light'|'dark', hex: string) => void
  };
};
