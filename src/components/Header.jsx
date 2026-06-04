import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header style={styles.header}>
      <button style={styles.iconButton} onClick={() => console.log('Open Settings')}>
        <Settings size={20} color="var(--text)" />
      </button>

      <h1 style={styles.title}>Мяу-дневник 🐱</h1>

      <button style={styles.iconButton} onClick={toggleTheme}>
        {theme === 'light' ? (
          <Sun size={20} color="var(--accent-2)" style={styles.sunIcon} />
        ) : (
          <Moon size={20} color="var(--accent)" style={styles.moonIcon} />
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
    padding: '12px 16px',
    position: 'sticky',
    top: 0,
    backgroundColor: 'var(--bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 100,
    borderBottom: '1px solid var(--border)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 800,
    margin: 0,
    color: 'var(--text)',
  },
  iconButton: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: 'var(--surface-2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 200ms var(--transition-base)',
    border: 'none',
  },
  sunIcon: {
    animation: 'rotateScale 400ms var(--transition-base)',
  },
  moonIcon: {
    animation: 'appearScale 400ms var(--transition-base)',
  },
};

export default Header;
