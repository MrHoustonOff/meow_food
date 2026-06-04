import React, { useState, useRef } from 'react';
import Header from './components/Header';
import SettingsPage from './components/SettingsPage';
import { Send, Cat } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useSettings } from './hooks/useSettings';
import styles from './App.module.css';

/* ─── КОНТЕКСТНЫЕ ПРИВЕТСТВИЯ ─────────────────────────────────── */
const GREETINGS = {
  morning: ['Доброе утро~ Что было на завтрак? 🌅', 'Утро началось! Расскажи что покушал~'],
  day:     ['Обедал(а) уже?~ Расскажи! ☀️', 'Самое время для обеда~ Что ел?'],
  evening: ['Ужин уже? Или ещё перекус?~ 🌆', 'Вечерок! Расскажи что сегодня ел~'],
  night:   ['Поздний перекус? Никто не осудит~ 🌙', 'Не сплю — жду твой рассказ~ 🌙'],
};

const PLACEHOLDERS = [
  'Я сегодня поймал ТАКУЮ РЫБУУ...',
  'Я сегодня поел...',
  'Рыбка, рыбка, рыбка...',
  'Ох кушал я сегодня...',
  'Расскажи мне что ты кушал, мяу~',
];

function getGreeting() {
  const h = new Date().getHours();
  const pool = h >= 5 && h < 11 ? GREETINGS.morning
             : h >= 11 && h < 16 ? GREETINGS.day
             : h >= 16 && h < 21 ? GREETINGS.evening
             : GREETINGS.night;
  return pool[Math.floor(Math.random() * pool.length)];
}

const BASE_HEIGHT_MULTIPLIER = 1.5;

function App() {
  // ── Глобальный стейт ──────────────────────────────────────────
  const { theme, accents, setTheme, toggleTheme, setAccent } = useTheme();
  const { settings, updateField } = useSettings();

  // ── Навигация ──────────────────────────────────────────────────
  const [view, setView] = useState('home'); // 'home' | 'settings'

  // ── Главный экран ──────────────────────────────────────────────
  const [text, setText] = useState('');
  const [greeting] = useState(getGreeting);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );
  const textareaRef = useRef(null);
  const baseHeightRef = useRef(null);

  const handleInput = (e) => {
    setText(e.target.value);
    const ta = textareaRef.current;
    if (!ta) return;

    ta.style.height = 'auto';
    ta.style.overflowY = 'hidden';

    if (baseHeightRef.current === null) {
      baseHeightRef.current = ta.scrollHeight;
    }

    const base = baseHeightRef.current;
    const maxH = Math.round(base * BASE_HEIGHT_MULTIPLIER);
    const desired = ta.scrollHeight;

    if (desired <= maxH) {
      ta.style.height = `${desired}px`;
      ta.style.overflowY = 'hidden';
      ta.classList.remove(styles.textareaScrollable);
    } else {
      ta.style.height = `${maxH}px`;
      ta.style.overflowY = 'scroll';
      ta.classList.add(styles.textareaScrollable);
    }
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    console.log('Отправляем:', text);
  };

  // ── Страница настроек ─────────────────────────────────────────
  if (view === 'settings') {
    return (
      <SettingsPage
        onBack={() => setView('home')}
        settings={settings}
        updateField={updateField}
        theme={theme}
        setTheme={setTheme}
        accents={accents}
        setAccent={setAccent}
      />
    );
  }

  // ── Главный экран ─────────────────────────────────────────────
  return (
    <div className="screen">
      <div className={styles.screenInner}>
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onSettings={() => setView('settings')}
        />

        <main className={`scroll-area ${styles.main}`}>
          <div className={`container safe-bottom ${styles.content}`}>

            {/* ── АВАТАРКА И ПРИВЕТСТВИЕ ── */}
            <section className={styles.hero}>
              <div className={`${styles.catAvatar} glass-mid anim-float`}>
                <Cat size={44} strokeWidth={1.5} className={styles.catIcon} />
              </div>
              <p className={`${styles.greeting} text-title-3`}>
                {greeting}
              </p>
            </section>

            {/* ── ВВОД ── */}
            <section className={styles.inputSection}>
              <div className={`${styles.inputWrap} glass-mid`}>
                <textarea
                  ref={textareaRef}
                  id="meal-input"
                  className={styles.textarea}
                  value={text}
                  onInput={handleInput}
                  onChange={handleInput}
                  placeholder={placeholder}
                  rows={6}
                  aria-label="Расскажи что ты ел"
                />
              </div>

              <button
                id="btn-submit"
                className={`${styles.submitButton} no-select`}
                onClick={handleSubmit}
                disabled={!text.trim()}
                aria-label="Отправить котику"
              >
                <Send size={17} strokeWidth={2.5} />
                <span>Отправить котику 🐾</span>
              </button>
            </section>

            <div className="bottom-nav-spacer" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
