import React, { useState } from 'react';
import { Settings, Sun, Moon, Book } from 'lucide-react';
import styles from './Header.module.css';

/*
 * Header — верхняя панель главного экрана.
 * НЕ тянет useTheme сам — получает theme/toggleTheme через пропсы,
 * чтобы стейт жил в одном месте (App.jsx).
 *
 * Props:
 *   theme       — 'light' | 'dark'
 *   toggleTheme — () => void
 *   onSettings  — () => void
 *   onJournal   — () => void
 */
const Header = ({ theme, toggleTheme, onSettings, onJournal }) => {
  const [settingsPressed, setSettingsPressed] = useState(false);
  const [journalPressed, setJournalPressed] = useState(false);

  return (
    <header className={styles.header}>
      <button
        id="btn-journal"
        className={`${styles.iconButton} pressable no-select glass-mid`}
        onMouseDown={() => setJournalPressed(true)}
        onMouseUp={() => setJournalPressed(false)}
        onTouchStart={() => setJournalPressed(true)}
        onTouchEnd={() => setJournalPressed(false)}
        onClick={onJournal}
        aria-label="Мяунал еды"
      >
        <Book
          size={20}
          strokeWidth={2}
          className={styles.icon}
          style={{ opacity: journalPressed ? 0.6 : 1 }}
        />
      </button>

      <button
        id="btn-settings"
        className={`${styles.iconButton} pressable no-select glass-mid`}
        onMouseDown={() => setSettingsPressed(true)}
        onMouseUp={() => setSettingsPressed(false)}
        onTouchStart={() => setSettingsPressed(true)}
        onTouchEnd={() => setSettingsPressed(false)}
        onClick={onSettings}
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
