import React from 'react';
import styles from './SuccessCopyModal.module.css';

const SuccessCopyModal = ({ open, formattedText, onCopy, onHome }) => {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onHome}>
      <div 
        className={`${styles.card} glass-thick anim-pop-in`} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-title-3 ${styles.title}`}>Всё готово!</h2>
        <p className={styles.text}>
          Твой лог сохранён и красиво отформатирован. Можешь скопировать его!
        </p>

        <div className={styles.codeContainer}>
          <pre className={styles.pre}>{formattedText}</pre>
        </div>

        <div className={styles.buttonStack}>
          <button 
            id="btn-success-copy" 
            className={`${styles.btnSolid} pressable`} 
            onClick={onCopy}
          >
            Скопировать
          </button>
          <button 
            id="btn-success-close" 
            className={`${styles.btnGhost} pressable`} 
            onClick={onHome}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessCopyModal;
