import React from 'react';
import styles from './LoadingOverlay.module.css';

/**
 * LoadingOverlay — полноэкранный оверлей с CSS-котиком.
 *
 * @param {'ai'|'telegram'} type — определяет текст и настроение
 */
const MESSAGES = {
  ai:       'Бегу в волшебный кошачий мир, чтобы всё проверить!',
  telegram: 'Несу посылку в Telegram~ 📨',
};

function LoadingOverlay({ type = 'ai' }) {
  return (
    <div className={styles.overlay} aria-busy="true" role="status">
      {/* ── Сцена: котик + рыбка ── */}
      <div className={styles.scene}>
        {/* CSS-кот */}
        <div className={styles.cat}>
          <div className={styles.catHead} />
          <div className={styles.catEyes} />
          <div className={styles.catNose} />
          <div className={styles.catBody} />
          <div className={styles.catTail} />
          <div className={styles.catLegs}>
            <div className={styles.legFL} />
            <div className={styles.legFR} />
            <div className={styles.legBL} />
            <div className={styles.legBR} />
          </div>
        </div>

        {/* Рыбка */}
        <span className={styles.fish} aria-hidden="true">🐟</span>

        {/* «Земля» — бегущие чёрточки */}
        <div className={styles.ground}>
          <span /><span /><span />
        </div>
      </div>

      {/* ── Текст ── */}
      <p className={styles.text}>{MESSAGES[type]}</p>

      {/* ── Анимированные точки ── */}
      <div className={styles.dots} aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>
  );
}

export default LoadingOverlay;
