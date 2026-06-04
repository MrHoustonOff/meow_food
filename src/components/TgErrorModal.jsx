import React, { useState } from 'react';
import styles from './TgErrorModal.module.css';

export default function TgErrorModal({ open, errorText, onCopy, onHome }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!open) return null;

  // Закрываем модалку при клике вне карточки
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onHome();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={`${styles.card} glass-thick anim-pop-in`}>
        <h2 className={styles.title}>Ошибка Telegram</h2>
        <p className={styles.text}>
          Не удалось отправить сообщение, но твой красивый лог сохранён!
        </p>

        <div className={styles.buttonStack}>
          <button
            id="btn-tg-copy"
            className={`${styles.btnPrimary} pressable`}
            onClick={onCopy}
          >
            Скопировать ответ
          </button>

          {showDetails ? (
            <pre className={styles.detailsPre}>{errorText}</pre>
          ) : (
            <button
              className={`${styles.btnDetails} pressable`}
              onClick={() => setShowDetails(true)}
            >
              Посмотреть ошибку
            </button>
          )}

          <button
            id="btn-tg-close"
            className={`${styles.btnGhost} pressable`}
            onClick={onHome}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
