import React from 'react';
import Header from './components/Header';

function App() {
  return (
    <>
      <Header />
      <main style={styles.main}>
        <h2 style={{ color: 'var(--accent)' }}>Мяу! 🐾</h2>
        <p style={{ color: 'var(--text-muted)' }}>Добро пожаловать в твой уютный дневник питания.</p>
      </main>
    </>
  );
}

const styles = {
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center',
  },
};

export default App;
