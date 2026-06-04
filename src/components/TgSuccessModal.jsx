import React from 'react';
import { Cat } from 'lucide-react';
import styles from './SuccessCopyModal.module.css'; // Reusing styles for consistency

/**
 * TgSuccessModal — модалка успешной отправки в Телеграм.
 */
function TgSuccessModal({ open, onHome }) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onHome} role="dialog" aria-modal="true">
      <div 
        className={`${styles.card} glass-thick anim-pop-in`} 
        onClick={(e) => e.stopPropagation()}
        style={{ alignItems: 'center', textAlign: 'center' }}
      >
        <div className="glass-mid" style={{ padding: 'var(--space-3)', borderRadius: '50%', marginBottom: 'var(--space-2)' }}>
          <Cat size={40} strokeWidth={1.5} color="var(--accent)" />
        </div>
        
        <h2 className={styles.title}>Успех!</h2>
        
        <p className={styles.text} style={{ marginBottom: 'var(--space-4)' }}>
          Всё успешно доставлено в Telegram! Котик доволен 🐾
        </p>

        <div className={styles.buttonStack} style={{ width: '100%', marginTop: 0 }}>
          <button
            id="btn-tg-success"
            type="button"
            className={`${styles.btnPrimary} pressable`}
            onClick={onHome}
          >
            Окей
          </button>
        </div>
      </div>
    </div>
  );
}

export default TgSuccessModal;
