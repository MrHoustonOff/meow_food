import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={styles.header}>
      <button style={styles.iconButton} onClick={() => console.log('Open Settings')}>
        <Settings size={22} color="var(--text)" strokeWidth={2.2} />
      </button>

      <button style={styles.iconButton} onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun size={22} color="var(--accent-2)" style={styles.sunIcon} strokeWidth={2.2} />
        ) : (
          <Moon size={22} color="var(--accent)" style={styles.moonIcon} strokeWidth={2.2} />
        )}
      </button>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 20px 12px 20px', // Умеренный отступ сверху
    position: 'absolute', // Теперь он часть скролла
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  iconButton: {
    width: '46px',
    height: '46px',
    borderRadius: '23px',
    backgroundColor: 'var(--glass-bg)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 300ms var(--transition-base)',
    border: '1px solid var(--glass-border)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  sunIcon: {
    animation: 'rotateScale 400ms var(--transition-base)',
  },
  moonIcon: {
    animation: 'appearScale 400ms var(--transition-base)',
  },
};

export default Header;
