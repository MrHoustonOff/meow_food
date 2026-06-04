import React, { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import styles from './AiErrorModal.module.css';

export default function AiErrorModal({ open, errorText, onHome }) {
  // Блокируем скролл фона, когда модалка открыта
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onHome}>
      <div 
        className={`glass-thick anim-pop-in ${styles.card}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.iconContainer}>
          <AlertTriangle size={32} strokeWidth={2.5} />
        </div>
        
        <h2 className={`text-title-3 ${styles.title}`}>
          Упс! Произошла ошибка!
        </h2>
        
        <p className={`text-body ${styles.text}`}>
          Что-то пошло не так при общении с котиками. Твой текст сохранён!
        </p>

        {errorText && (
          <div className={styles.errorDetails}>
            <pre className="text-caption-2">{errorText}</pre>
          </div>
        )}

        <button 
          id="btn-ai-home" 
          className={`pressable ${styles.button}`}
          onClick={onHome}
        >
          <Home size={20} strokeWidth={2.5} />
          Домой
        </button>
      </div>
    </div>
  );
}
