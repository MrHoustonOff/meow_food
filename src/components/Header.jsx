import React, { useState } from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import styles from './Header.module.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [settingsPressed, setSettingsPressed] = useState(false);

  return (
    <header className={styles.header}>
      <button
        id="btn-settings"
        className={`${styles.iconButton} pressable no-select glass-mid`}
        onMouseDown={() => setSettingsPressed(true)}
        onMouseUp={() => setSettingsPressed(false)}
        onTouchStart={() => setSettingsPressed(true)}
        onTouchEnd={() => setSettingsPressed(false)}
        onClick={() => console.log('Open Settings')}
        aria-label="Настройки"
      >
        <Settings
          size={20}
          strokeWidth={2}
          className={styles.icon}
          style={{ opacity: settingsPressed ? 0.6 : 1 }}
        />
      </button>

      <button
        id="btn-theme-toggle"
        className={`${styles.iconButton} pressable no-select glass-mid`}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      >
        {theme === 'light' ? (
          <Sun
            size={19}
            strokeWidth={2}
            className={styles.iconTheme}
            style={{ animation: 'sunSpin 400ms var(--ease-spring) both' }}
          />
        ) : (
          <Moon
            size={19}
            strokeWidth={2}
            className={styles.iconTheme}
            style={{ animation: 'moonAppear 400ms var(--ease-spring) both' }}
          />
        )}
      </button>
    </header>
  );
};

export default Header;
