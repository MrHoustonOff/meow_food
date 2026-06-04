import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={styles.header}>
      <button style={styles.iconButton} onClick={() => console.log('Open Settings')}>
        <Settings size={22} color="var(--text)" strokeWidth={2.5} />
      </button>

      <button style={styles.iconButton} onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun size={22} color="var(--accent-2)" style={styles.sunIcon} strokeWidth={2.5} />
        ) : (
          <Moon size={22} color="var(--accent)" style={styles.moonIcon} strokeWidth={2.5} />
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
    padding: 'calc(12px + env(safe-area-inset-top)) 20px 12px 20px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  iconButton: {
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    backgroundColor: 'var(--surface-2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 200ms var(--transition-base), background-color 300ms ease',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  sunIcon: {
    animation: 'rotateScale 400ms var(--transition-base)',
  },
  moonIcon: {
    animation: 'appearScale 400ms var(--transition-base)',
  },
};

export default Header;
