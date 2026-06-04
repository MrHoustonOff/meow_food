import React, { useState, useEffect } from 'react';
import styles from './LoadingOverlay.module.css';

const MESSAGES = {
  ai:       'Бегу в волшебный кошачий мир, чтобы всё проверить!',
  telegram: 'Несу посылку в Telegram~ 📨',
};

const FRAMES_AI = [
  `   /\\_/\\  \n  ( o.o ) \n   > ^ <  \n  /|   |\\ \n (_|   |_)`,
  `   /\\_/\\  \n  ( o.o ) \n   >   <  \n  \\|   |/ \n (_|   |_)`,
  `   /\\_/\\  \n  ( -.- ) \n   > ^ <  \n  /|   |\\ \n (_|   |_)`
];

const FRAMES_TG = [
  `   /\\_/\\  \n  ( o.o ) \n  ( [✉] ) \n  /|   |\\ \n (_|   |_)`,
  `   /\\_/\\  \n  ( -.- ) \n  ( [✉] ) \n  \\|   |/ \n (_|   |_)`,
  `   /\\_/\\  \n  ( ^.^ ) \n  ( [✉] ) \n  /|   |\\ \n (_|   |_)`
];

function LoadingOverlay({ type = 'ai' }) {
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    const frames = type === 'ai' ? FRAMES_AI : FRAMES_TG;
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % frames.length);
    }, 250); // Скорость анимации ASCII (250мс на кадр)

    return () => clearInterval(timer);
  }, [type]);

  const currentFrame = (type === 'ai' ? FRAMES_AI : FRAMES_TG)[frameIdx];

  return (
    <div className={styles.overlay} aria-busy="true" role="status">
      <div className={styles.scene}>
        {/* Анимированный ASCII-кот */}
        <pre className={styles.asciiCat}>
          {currentFrame}
        </pre>

        {/* Рыбка (только для ИИ) */}
        {type === 'ai' && <span className={styles.fish} aria-hidden="true">🐟</span>}

        {/* «Земля» */}
        <div className={styles.ground}>
          <span /><span /><span />
        </div>
      </div>

      <p className={styles.text}>{MESSAGES[type]}</p>

      <div className={styles.dots} aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default LoadingOverlay;
