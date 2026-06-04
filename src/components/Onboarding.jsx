import React, { useState, useEffect } from 'react';
import styles from './Onboarding.module.css';

const Onboarding = ({ onComplete }) => {
  const [slide, setSlide] = useState(0);

  // Form state for slide 3 (index 3)
  const [groqKey, setGroqKey] = useState(localStorage.getItem('myau_groq_key') || '');
  const [tgToken, setTgToken] = useState(localStorage.getItem('myau_tg_token') || '');
  const [tgChatId, setTgChatId] = useState(localStorage.getItem('myau_tg_chat_id') || '');
  
  const [toast, setToast] = useState('');

  // Auto skip to keys if already started
  useEffect(() => {
    if (localStorage.getItem('myau_keys_started') === 'true' && slide < 3) {
      setSlide(3);
    }
  }, [slide]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const nextSlide = () => setSlide(s => Math.min(s + 1, 4));

  const handleKeysSubmit = () => {
    if (!groqKey.trim() || !tgToken.trim() || !tgChatId.trim()) {
      showToast('Мяу~ заполни все поля! 🐾');
      return;
    }
    
    // Save keys
    localStorage.setItem('myau_groq_key', groqKey.trim());
    localStorage.setItem('myau_tg_token', tgToken.trim());
    localStorage.setItem('myau_tg_chat_id', tgChatId.trim());
    
    nextSlide();
  };

  const finishOnboarding = () => {
    localStorage.setItem('myau_onboarding_complete', 'true');
    onComplete();
  };

  return (
    <div className={styles.onboardingContainer}>
      {/* SLIDE 0: Welcome */}
      {slide === 0 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat} ${styles.catBreathe}`}>
            {` /\\_/\\ \n( o.o )\n > ^ < `}
          </div>
          <h1 className={styles.title}>Привет!</h1>
          <p className={styles.text}>Я твой котик-дневник~ 🐱</p>
          <button className={`${styles.button} pressable`} onClick={nextSlide}>
            Привет!
          </button>
        </div>
      )}

      {/* SLIDE 1: Features */}
      {slide === 1 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat} ${styles.catBreathe}`}>
            {` /\\_/\\   ___\n( -.- ) (   )\n > ^ <   ---`}
          </div>
          <h1 className={styles.title}>Я запомню всё что ты ел~</h1>
          <p className={styles.text}>
            Просто расскажи мне,<br/>
            а я отправлю это в телеграм!<br/><br/>
            Никаких таблиц. Никаких калорий.<br/>
            Просто дневник. Мяу.
          </p>
          <button className={`${styles.button} pressable`} onClick={nextSlide}>
            Понятно~
          </button>
        </div>
      )}

      {/* SLIDE 2: Keys warning */}
      {slide === 2 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat} ${styles.catBreathe}`}>
            {` /\\_/\\   .-.\n( 0.0 )--| |\n > ^ <   '-'`}
          </div>
          <h1 className={styles.title}>Но перед этим мне нужны<br/>твои секретные ключики~</h1>
          <p className={styles.text}>
            Я честно никому их не расскажу!<br/>
            Всё хранится только на твоём телефоне 🤫
          </p>
          <a 
            href="https://t.me/meow_meow_food/2" 
            target="_blank" 
            rel="noreferrer"
            className={styles.buttonLink}
          >
            Как получить ключики?
          </a>
          <button 
            className={`${styles.button} pressable`} 
            onClick={() => {
              localStorage.setItem('myau_keys_started', 'true');
              nextSlide();
            }}
          >
            Хорошо, давай!
          </button>
        </div>
      )}

      {/* SLIDE 3: Keys input */}
      {slide === 3 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat}`}>
            {` /\\_/\\   ✍️\n( 0_0 ) /\n > ^ < `}
          </div>
          <h1 className={styles.title} style={{ fontSize: '20px' }}>Введи свои ключики~</h1>
          
          <div className={styles.formContainer}>
            <div className={styles.fieldGroup}>
              <span className={styles.label}>🤖 Groq API Key</span>
              <input 
                type="password"
                className={styles.input}
                value={groqKey}
                onChange={e => setGroqKey(e.target.value)}
                placeholder="gsk_••••••••"
              />
            </div>
            
            <div className={styles.fieldGroup}>
              <span className={styles.label}>📨 Telegram Bot Token</span>
              <input 
                type="password"
                className={styles.input}
                value={tgToken}
                onChange={e => setTgToken(e.target.value)}
                placeholder="123456:ABC-••••••••"
              />
            </div>
            
            <div className={styles.fieldGroup}>
              <span className={styles.label}>💬 Telegram Chat ID</span>
              <input 
                type="password"
                className={styles.input}
                value={tgChatId}
                onChange={e => setTgChatId(e.target.value)}
                placeholder="123456789"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto', marginBottom: 'var(--space-4)', width: '100%', maxWidth: '280px' }}>
            <button 
              className={`${styles.button} ${styles.buttonOutline} pressable`} 
              style={{ flex: 1, height: '48px', fontSize: '16px' }}
              onClick={() => setSlide(5)}
            >
              Пропустить
            </button>
            <button 
              className={`${styles.button} pressable`} 
              style={{ flex: 1, height: '48px', fontSize: '16px', marginTop: 0, marginBottom: 0 }}
              onClick={handleKeysSubmit}
            >
              Готово~
            </button>
          </div>
          
          {toast && <div className={styles.toast}>{toast}</div>}
        </div>
      )}

      {/* SLIDE 4: Final (Success) */}
      {slide === 4 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat} ${styles.catJump}`}>
            {` \\*_*/\n( ^.^ )\n > ^ < `}
          </div>
          <h1 className={styles.title}>Вот и всё~</h1>
          <p className={styles.text}>
            Теперь расскажи мне<br/>что ты только что поел!
          </p>
          <button className={`${styles.button} pressable`} onClick={finishOnboarding}>
            Поехали! 🐱
          </button>
        </div>
      )}

      {/* SLIDE 5: Final (Skipped) */}
      {slide === 5 && (
        <div className={styles.slide}>
          <div className={`${styles.asciiCat}`}>
            {` /\\_/\\   ;(\n( U_U )\n > ^ < `}
          </div>
          <h1 className={styles.title}>Хорошо!</h1>
          <p className={styles.text}>
            Но тебе <b>НЕОБХОДИМО</b> добавить<br/>
            их позже в настройках~
          </p>
          <button className={`${styles.button} pressable`} onClick={finishOnboarding}>
            Поехали! 🐱
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
