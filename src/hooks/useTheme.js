import { useState, useEffect } from 'react';

// Должны совпадать с --bg-app в tokens.css
const BG_COLORS = {
  light: '#F2F2F7',
  dark:  '#000000',
};

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('myau_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const bgColor = BG_COLORS[theme] ?? BG_COLORS.light;

    // 1. data-theme — CSS-переменные переключаются здесь автоматически,
    //    включая html { background-color: var(--bg-app) } из reset.css
    root.setAttribute('data-theme', theme);

    // 2. color-scheme — браузер перекрашивает нативные элементы,
    //    скроллбары и safe-area зоны
    root.style.colorScheme = theme;

    // 3. theme-color мета-тег — статус-бар и адресная строка Safari
    const metaMain = document.getElementById('theme-color-main');
    if (metaMain) {
      metaMain.setAttribute('content', bgColor);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.id = 'theme-color-main';
      meta.content = bgColor;
      document.head.appendChild(meta);
    }

    localStorage.setItem('myau_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};

